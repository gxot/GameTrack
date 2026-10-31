import { useEffect, useRef, useState } from 'react';
import { getGames, getGenres } from '../services/gamesService';
import { isRequestCanceled, RawgError } from '../services/api';

function requestError(error, operation) {
  return {
    operation,
    code: error instanceof RawgError ? error.code : 'REQUEST_FAILED',
    message: error instanceof RawgError ? error.message : 'Não foi possível carregar os dados. Tente novamente.',
  };
}

function uniqueGames(games) {
  const seen = new Set();
  return games.filter((game) => {
    if (seen.has(game.id)) return false;
    seen.add(game.id);
    return true;
  });
}

export default function useGames() {
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [genresError, setGenresError] = useState(null);

  const mounted = useRef(false);
  const gamesRequest = useRef(null);
  const genresRequest = useRef(null);
  // Referências mantêm os bloqueios e a página atualizados entre eventos consecutivos.
  const catalog = useRef({ page: 0, hasNextPage: false, hasLoaded: false, genre: null, error: null });

  async function loadGames(operation) {
    if (!mounted.current) return;
    const current = catalog.current;
    if (operation === 'more' && (gamesRequest.current || !current.hasLoaded || !current.hasNextPage)) return;
    if (operation === 'refresh' && gamesRequest.current?.operation === 'refresh') return;

    gamesRequest.current?.controller.abort();
    const request = {
      controller: new AbortController(),
      operation,
      genre: current.genre,
      page: operation === 'more' ? current.page + 1 : 1,
    };
    gamesRequest.current = request;
    current.error = null;
    setError(null);
    setIsLoading(operation === 'initial');
    setIsLoadingMore(operation === 'more');
    setIsRefreshing(operation === 'refresh');

    if (operation === 'initial') {
      current.page = 0;
      current.hasLoaded = false;
      current.hasNextPage = false;
      setGames([]);
      setPage(0);
      setHasNextPage(false);
    }

    try {
      const result = await getGames({ page: request.page, genre: request.genre, signal: request.controller.signal });
      // Além do cancelamento, a identidade impede que respostas antigas sejam aplicadas.
      if (!mounted.current || gamesRequest.current !== request) return;
      setGames((previous) => uniqueGames(operation === 'more' ? [...previous, ...result.games] : result.games));
      current.page = result.page;
      current.hasNextPage = result.hasNextPage;
      current.hasLoaded = true;
      setPage(result.page);
      setHasNextPage(result.hasNextPage);
    } catch (failure) {
      if (!mounted.current || gamesRequest.current !== request || isRequestCanceled(failure)) return;
      const nextError = requestError(failure, operation);
      current.error = nextError;
      setError(nextError);
    } finally {
      if (mounted.current && gamesRequest.current === request) {
        gamesRequest.current = null;
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    }
  }

  async function loadGenres() {
    if (!mounted.current || genresRequest.current) return;
    const controller = new AbortController();
    genresRequest.current = controller;
    setIsLoadingGenres(true);
    setGenresError(null);
    try {
      const result = await getGenres({ signal: controller.signal });
      if (mounted.current && genresRequest.current === controller) {
        const seenIds = new Set();
        const seenSlugs = new Set();
        setGenres(result.filter((genre) => {
          if (seenIds.has(genre.id) || seenSlugs.has(genre.slug)) return false;
          seenIds.add(genre.id);
          seenSlugs.add(genre.slug);
          return true;
        }));
      }
    } catch (failure) {
      if (mounted.current && genresRequest.current === controller && !isRequestCanceled(failure)) {
        setGenresError(requestError(failure, 'genres'));
      }
    } finally {
      if (mounted.current && genresRequest.current === controller) {
        genresRequest.current = null;
        setIsLoadingGenres(false);
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    loadGames('initial');
    loadGenres();
    return () => {
      mounted.current = false;
      gamesRequest.current?.controller.abort();
      genresRequest.current?.abort();
      gamesRequest.current = null;
      genresRequest.current = null;
    };
    // As funções leem referências; este efeito controla somente o ciclo de montagem.
  }, []);

  function selectGenre(slug) {
    if (!mounted.current || catalog.current.genre === slug) return;
    catalog.current.genre = slug;
    setSelectedGenre(slug);
    loadGames('initial');
  }

  function loadMore() {
    // Erros precisam de repetição explícita, evitando ciclos de onEndReached.
    if (catalog.current.error) return;
    loadGames('more');
  }

  function retry() {
    const operation = catalog.current.error?.operation || 'initial';
    if (gamesRequest.current) return;
    loadGames(operation);
  }

  return {
    games, page, hasNextPage, isLoading, isLoadingMore, isRefreshing, error,
    genres, isLoadingGenres, genresError, selectedGenre, selectGenre,
    loadFirstPage: () => loadGames('initial'),
    refresh: () => loadGames('refresh'),
    loadMore, retry, retryGenres: loadGenres,
  };
}
