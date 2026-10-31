import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { readCompleted, writeCompleted, toCompletedRecord, validateGameId, validatePersonalRating } from '../services/userStorage';

const CompletedContext = createContext(undefined);

export function CompletedProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [completedGames, setCompletedGames] = useState([]);
  const [isLoadingCompleted, setLoading] = useState(true);
  const [isCompletedReady, setReady] = useState(false);
  const [isSavingCompleted, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const session = useRef(null);
  const records = useRef([]);
  const queue = useRef(Promise.resolve());

  function isActive(owner) {
    return owner?.active && session.current === owner;
  }

  async function reloadCompleted() {
    const owner = session.current;
    if (!isActive(owner) || owner.loading || owner.pending > 0) return;
    owner.loading = true;
    owner.ready = false;
    setLoading(true);
    setReady(false);
    setError(null);
    try {
      const stored = await readCompleted(owner.userId);
      if (!isActive(owner)) return;
      records.current = stored;
      owner.ready = true;
      setCompletedGames(() => stored);
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
    setCompletedGames(() => []);
    setReady(false);
    setSaving(false);
    reloadCompleted();
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
      return Promise.reject(new Error('Aguarde o carregamento dos jogos finalizados ou tente carregá-los novamente.'));
    }
    owner.pending += 1;
    setSaving(true);
    const result = queue.current.then(async () => {
      try {
        if (!isActive(owner)) throw new Error('A sessão foi encerrada.');
        const next = transform(records.current);
        // O ID foi capturado antes da fila; nunca é obtido de uma conta posterior.
        const saved = await writeCompleted(owner.userId, next);
        if (isActive(owner)) {
          records.current = saved;
          setCompletedGames(() => saved);
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

  function isCompleted(gameId) { return completedGames.some((game) => game.id === gameId); }
  function getPersonalRating(gameId) { return completedGames.find((game) => game.id === gameId)?.personalRating ?? null; }
  function markCompleted(game, rating) {
    return mutate((previous) => {
      const record = toCompletedRecord(game, rating);
      return previous.some((item) => item.id === record.id)
        ? previous.map((item) => item.id === record.id ? record : item) : [...previous, record];
    });
  }
  function updateRating(gameId, rating) {
    return mutate((previous) => {
      validateGameId(gameId);
      validatePersonalRating(rating);
      if (!previous.some((game) => game.id === gameId)) throw new Error('Marque o jogo como finalizado antes de alterar a nota.');
      return previous.map((game) => game.id === gameId ? { ...game, personalRating: rating } : game);
    });
  }
  function removeCompleted(gameId) {
    return mutate((previous) => {
      validateGameId(gameId);
      return previous.filter((game) => game.id !== gameId);
    });
  }

  return (
    <CompletedContext.Provider value={{
      completedGames, isLoadingCompleted, isCompletedReady, isSavingCompleted,
      isCompleted, getPersonalRating, markCompleted, updateRating, removeCompleted, error, reloadCompleted,
    }}>
      {children}
    </CompletedContext.Provider>
  );
}

export function useCompleted() {
  const context = useContext(CompletedContext);
  if (context === undefined) throw new Error('useCompleted deve ser utilizado dentro de CompletedProvider.');
  return context;
}
