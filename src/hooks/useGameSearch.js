import { useEffect, useRef, useState } from 'react';
import { searchGames } from '../services/gamesService';
import { isRequestCanceled, RawgError } from '../services/api';

export default function useGameSearch() {
  const [state, setState] = useState({
    term: '', games: [], isLoading: false, error: null, hasSearched: false,
  });
  const mounted = useRef(false);
  const activeRequest = useRef(null);
  const lastTerm = useRef('');

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      activeRequest.current?.controller.abort();
      activeRequest.current = null;
    };
  }, []);

  async function search(value) {
    const term = typeof value === 'string' ? value.trim() : '';
    if (!mounted.current || !term || activeRequest.current?.term === term) return;
    activeRequest.current?.controller.abort();
    const request = { term, controller: new AbortController() };
    activeRequest.current = request;
    lastTerm.current = term;
    setState({ term, games: [], isLoading: true, error: null, hasSearched: true });
    try {
      const result = await searchGames(term, { signal: request.controller.signal });
      if (!mounted.current || activeRequest.current !== request) return;
      const seen = new Set();
      const games = result.games.filter((game) => {
        if (seen.has(game.id)) return false;
        seen.add(game.id);
        return true;
      });
      setState((previous) => ({ ...previous, games }));
    } catch (failure) {
      if (!mounted.current || activeRequest.current !== request || isRequestCanceled(failure)) return;
      setState((previous) => ({
        ...previous,
        error: failure instanceof RawgError ? failure.message : 'Não foi possível pesquisar os jogos. Tente novamente.',
      }));
    } finally {
      if (mounted.current && activeRequest.current === request) {
        activeRequest.current = null;
        setState((previous) => ({ ...previous, isLoading: false }));
      }
    }
  }

  function retry() {
    return search(lastTerm.current);
  }

  return { ...state, search, retry };
}
