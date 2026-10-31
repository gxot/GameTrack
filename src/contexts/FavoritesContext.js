import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { readFavorites, writeFavorites, toFavoriteRecord, validateGameId } from '../services/userStorage';

const FavoritesContext = createContext(undefined);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setLoading] = useState(true);
  const [isFavoritesReady, setReady] = useState(false);
  const [isSavingFavorites, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const session = useRef(null);
  const records = useRef([]);
  const queue = useRef(Promise.resolve());

  function isActive(owner) {
    return owner?.active && session.current === owner;
  }

  async function reloadFavorites() {
    const owner = session.current;
    if (!isActive(owner) || owner.loading || owner.pending > 0) return;
    owner.loading = true;
    owner.ready = false;
    setLoading(true);
    setReady(false);
    setError(null);
    try {
      const stored = await readFavorites(owner.userId);
      if (!isActive(owner)) return;
      records.current = stored;
      owner.ready = true;
      setFavorites(() => stored);
      setReady(true);
    } catch (failure) {
      if (isActive(owner)) setError(failure.message);
    } finally {
      if (isActive(owner)) {
        owner.loading = false;
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const owner = { userId, active: true, ready: false, loading: false, pending: 0 };
    session.current = owner;
    records.current = [];
    queue.current = Promise.resolve();
    setFavorites(() => []);
    setReady(false);
    setSaving(false);
    reloadFavorites();
    return () => {
      owner.active = false;
      if (session.current === owner) {
        session.current = null;
        records.current = [];
      }
    };
  }, [userId]);

  function mutate(transform) {
    const owner = session.current;
    if (!isActive(owner) || !owner.ready || owner.loading) {
      return Promise.reject(new Error('Aguarde o carregamento dos favoritos ou tente carregá-los novamente.'));
    }
    owner.pending += 1;
    setSaving(true);
    const result = queue.current.then(async () => {
      try {
        if (!isActive(owner)) throw new Error('A sessão foi encerrada.');
        const next = transform(records.current);
        // O ID foi capturado antes da fila; nunca é obtido de uma conta posterior.
        const saved = await writeFavorites(owner.userId, next);
        if (isActive(owner)) {
          records.current = saved;
          setFavorites(() => saved);
          setError(null);
        }
      } catch (failure) {
        if (isActive(owner)) setError(failure.message);
        throw failure;
      } finally {
        owner.pending -= 1;
        if (isActive(owner)) setSaving(owner.pending > 0);
      }
    });
    queue.current = result.catch(() => {});
    return result;
  }

  function isFavorite(gameId) { return favorites.some((game) => game.id === gameId); }
  function addFavorite(game) {
    return mutate((previous) => {
      const record = toFavoriteRecord(game);
      return previous.some((item) => item.id === record.id) ? previous : [...previous, record];
    });
  }
  function removeFavorite(gameId) {
    return mutate((previous) => {
      validateGameId(gameId);
      return previous.filter((item) => item.id !== gameId);
    });
  }
  function toggleFavorite(game) {
    return mutate((previous) => {
      const record = toFavoriteRecord(game);
      return previous.some((item) => item.id === record.id)
        ? previous.filter((item) => item.id !== record.id) : [...previous, record];
    });
  }

  return (
    <FavoritesContext.Provider value={{
      favorites, isLoadingFavorites, isFavoritesReady, isSavingFavorites,
      isFavorite, addFavorite, removeFavorite, toggleFavorite, error, reloadFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) throw new Error('useFavorites deve ser utilizado dentro de FavoritesProvider.');
  return context;
}
