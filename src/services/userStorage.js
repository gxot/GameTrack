import AsyncStorage from '@react-native-async-storage/async-storage';

const operations = new Map();

function collectionKey(userId, collection) {
  if (typeof userId !== 'string' || !userId.trim()) throw new Error('Entre na sua conta para acessar suas coleções.');
  return '@gametrack/user/' + encodeURIComponent(userId) + '/' + collection;
}

export function validateGameId(id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Este jogo não possui um identificador válido.');
}

export function validatePersonalRating(rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Selecione uma nota pessoal de 1 a 5 estrelas.');
  }
}

function optionalText(value) {
  if (value == null) return null;
  if (typeof value !== 'string') throw new Error('Os dados deste jogo são inválidos.');
  return value.trim() || null;
}

export function toFavoriteRecord(game) {
  validateGameId(game?.id);
  if (typeof game.name !== 'string' || !game.name.trim()) throw new Error('O nome do jogo não está disponível.');
  return {
    id: game.id,
    name: game.name.trim(),
    background_image: optionalText(game.background_image),
    released: optionalText(game.released),
  };
}

export function toCompletedRecord(game, rating) {
  validatePersonalRating(rating);
  return { ...toFavoriteRecord(game), personalRating: rating };
}

function normalizeCollection(records, collection) {
  if (!Array.isArray(records)) throw new Error('A coleção armazenada é inválida.');
  const unique = new Map();
  records.forEach((record) => {
    const normalized = collection === 'favorites'
      ? toFavoriteRecord(record) : toCompletedRecord(record, record?.personalRating);
    unique.set(normalized.id, normalized);
  });
  return [...unique.values()];
}

// A fila por chave também coordena leituras com escritas de Providers já desmontados.
function enqueue(userId, collection, operation) {
  const key = collectionKey(userId, collection);
  const previous = operations.get(key) || Promise.resolve();
  const result = previous.then(() => operation(key));
  const tail = result.catch(() => {});
  operations.set(key, tail);
  tail.then(() => { if (operations.get(key) === tail) operations.delete(key); });
  return result;
}

function readCollection(userId, collection) {
  return enqueue(userId, collection, async (key) => {
    try {
      const stored = await AsyncStorage.getItem(key);
      return stored === null ? [] : normalizeCollection(JSON.parse(stored), collection);
    } catch {
      const label = collection === 'favorites' ? 'os favoritos' : 'os jogos finalizados';
      throw new Error('Não foi possível carregar ' + label + '. Os dados salvos não foram apagados. Tente novamente.');
    }
  });
}

function writeCollection(userId, collection, records) {
  return enqueue(userId, collection, async (key) => {
    const normalized = normalizeCollection(records, collection);
    try {
      await AsyncStorage.setItem(key, JSON.stringify(normalized));
      return normalized;
    } catch {
      const label = collection === 'favorites' ? 'os favoritos' : 'os jogos finalizados e suas avaliações';
      throw new Error('Não foi possível salvar ' + label + '. Tente novamente.');
    }
  });
}

export const readFavorites = (userId) => readCollection(userId, 'favorites');
export const writeFavorites = (userId, records) => writeCollection(userId, 'favorites', records);
export const readCompleted = (userId) => readCollection(userId, 'completed');
export const writeCompleted = (userId, records) => writeCollection(userId, 'completed', records);
