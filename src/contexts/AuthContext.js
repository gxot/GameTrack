import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { loginLocal, logoutLocal, registerLocal, restoreSession } from '../services/authStorage';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const operationInProgress = useRef(false);

  useEffect(() => {
    let isActive = true;
    async function initialize() {
      try {
        const restoredUser = await restoreSession();
        if (isActive) setUser(restoredUser);
      } catch {
        if (isActive) setUser(null);
      } finally {
        if (isActive) setIsInitializing(false);
      }
    }
    initialize();
    return () => { isActive = false; };
  }, []);

  async function updateSession(operation) {
    if (isInitializing || operationInProgress.current) {
      throw new Error('Aguarde a operação atual terminar.');
    }
    operationInProgress.current = true;
    try {
      const nextUser = await operation();
      setUser(nextUser);
    } finally {
      operationInProgress.current = false;
    }
  }

  function login(email, password) {
    return updateSession(() => loginLocal(email, password));
  }
  function register(name, email, password) {
    return updateSession(() => registerLocal(name, email, password));
  }
  function logout() {
    return updateSession(async () => {
      await logoutLocal();
      return null;
    });
  }

  return (
    <AuthContext.Provider value={{ user, isInitializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  return context;
}
