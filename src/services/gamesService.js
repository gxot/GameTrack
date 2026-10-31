import api, { RawgError } from './api';

function invalidResponse() {
  return new RawgError('A RAWG retornou dados inesperados. Tente novamente.', 'INVALID_RESPONSE');
}

function isPageLink(value) {
  return value === null || (typeof value === 'string' && /^https?:\/\//.test(value));
}

function readPage(data) {
  if (!data || !Array.isArray(data.results)
    || !Number.isInteger(data.count) || data.count < 0
    || !isPageLink(data.next) || !isPageLink(data.previous)) {
    throw invalidResponse();
  }
  return data;
}

function normalizeGenre(genre) {
  if (!genre || !Number.isInteger(genre.id) || genre.id <= 0
    || typeof genre.name !== 'string' || !genre.name.trim()
    || typeof genre.slug !== 'string' || !genre.slug.trim()) {
    throw invalidResponse();
  }
  return { id: genre.id, name: genre.name.trim(), slug: genre.slug.trim() };
}

function optionalString(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw invalidResponse();
  return value.trim() || null;
}

function normalizeGame(game) {
  if (!game || !Number.isInteger(game.id) || game.id <= 0
    || typeof game.name !== 'string' || !game.name.trim()
    || (game.genres != null && !Array.isArray(game.genres))
    || (game.rating != null && (!Number.isFinite(game.rating) || game.rating < 0 || game.rating > 5))) {
    throw invalidResponse();
  }
  return {
    id: game.id,
    name: game.name.trim(),
    background_image: optionalString(game.background_image),
    released: optionalString(game.released),
    rating: game.rating > 0 ? game.rating : null,
    genres: (game.genres || []).map(normalizeGenre),
  };
}

export async function getGames({ page = 1, genre = null, signal } = {}) {
  if (!Number.isInteger(page) || page < 1) {
    throw new RawgError('A página solicitada é inválida.', 'INVALID_PAGE');
  }
  const { data } = await api.get('/games', {
    signal,
    params: { page, page_size: 20, ordering: '-added', ...(genre ? { genres: genre } : {}) },
  });
  const response = readPage(data);
  return {
    games: response.results.map(normalizeGame),
    page,
    count: response.count,
    hasNextPage: response.next !== null,
  };
}

export async function getGenres({ signal } = {}) {
  const { data } = await api.get('/genres', { signal, params: { page_size: 40 } });
  return readPage(data).results.map(normalizeGenre);
}

export async function searchGames(term, { signal } = {}) {
  const search = typeof term === 'string' ? term.trim() : '';
  if (!search) throw new RawgError('Digite o nome de um jogo para pesquisar.', 'INVALID_SEARCH');
  const { data } = await api.get('/games', {
    signal,
    params: { search, page: 1, page_size: 20 },
  });
  const response = readPage(data);
  return {
    games: response.results.map(normalizeGame),
    page: 1,
    count: response.count,
    hasNextPage: response.next !== null,
  };
}

function descriptionToText(description) {
  if (typeof description !== 'string') return '';
  const entities = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    ndash: '–', mdash: '—', hellip: '…', lsquo: '‘', rsquo: '’',
    ldquo: '“', rdquo: '”', bull: '•', copy: '©', reg: '®', trade: '™',
    aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
    agrave: 'à', acirc: 'â', ecirc: 'ê', ocirc: 'ô', atilde: 'ã', otilde: 'õ',
    ccedil: 'ç', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
    Agrave: 'À', Acirc: 'Â', Ecirc: 'Ê', Ocirc: 'Ô', Atilde: 'Ã', Otilde: 'Õ', Ccedil: 'Ç',
  };
  return description
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|li)>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (entity, value) => {
      if (value.startsWith('#')) {
        const hex = value.slice(0, 2).toLowerCase() === '#x';
        const code = parseInt(value.slice(hex ? 2 : 1), hex ? 16 : 10);
        if (code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)) {
          return String.fromCodePoint(code);
        }
        return '';
      }
      return entities[value] ?? entity;
    })
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function optionalNames(items, getItem) {
  if (items == null) return [];
  if (!Array.isArray(items)) throw invalidResponse();
  return [...new Set(items.map((item) => {
    const value = getItem(item);
    return typeof value?.name === 'string' ? value.name.trim() : '';
  }).filter(Boolean))];
}

export async function getGameDetails(id, { signal } = {}) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new RawgError('O identificador do jogo é inválido. Volte à lista e selecione um jogo.', 'INVALID_GAME_ID');
  }
  const response = await api.get('/games/' + id, {
    signal,
    // Trata 404 aqui sem alterar o interceptor compartilhado do catálogo.
    validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
  });
  if (response.status === 404) {
    throw new RawgError('Este jogo não foi encontrado na RAWG. Volte à lista e escolha outro jogo.', 'GAME_NOT_FOUND');
  }
  const data = response.data;
  const game = normalizeGame(data);
  if (game.id !== id) throw invalidResponse();
  return {
    ...game,
    platforms: optionalNames(data.platforms, (item) => item?.platform),
    developers: optionalNames(data.developers, (item) => item),
    description: typeof data.description_raw === 'string' && data.description_raw.trim()
      ? data.description_raw.trim() : descriptionToText(data.description),
    playtime: Number.isFinite(data.playtime) && data.playtime > 0 ? data.playtime : null,
  };
}
