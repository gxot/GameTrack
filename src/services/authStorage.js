import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const PROFILES_KEY = '@gametrack/profiles';
const SESSION_KEY = 'gametrack.activeUserId';
const credentialKey = (id) => 'gametrack.credential.' + id;
const secureOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
class AuthError extends Error {}

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

// Evita operações concorrentes sobre a lista de perfis e a sessão.
let pendingOperation = Promise.resolve();
function storageOperation(operation) {
  const result = pendingOperation.then(operation).catch((error) => {
    if (error instanceof AuthError) throw error;
    throw new AuthError('Não foi possível acessar os dados locais. Tente novamente.');
  });
  pendingOperation = result.catch(() => {});
  return result;
}

async function readProfiles() {
  const stored = await AsyncStorage.getItem(PROFILES_KEY);
  if (stored === null) return [];
  const profiles = JSON.parse(stored);
  if (!Array.isArray(profiles) || profiles.some((profile) => (
    !profile || typeof profile.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(profile.id)
    || typeof profile.name !== 'string' || !profile.name.trim()
    || typeof profile.email !== 'string' || !isValidEmail(profile.email)
  ))) {
    throw new AuthError('Os perfis locais não puderam ser lidos. Tente novamente.');
  }
  return profiles.map(({ id, name, email }) => ({ id, name, email: normalizeEmail(email) }));
}

function validateCredentials(email, password) {
  if (!email || typeof password !== 'string' || !password.trim()) {
    throw new AuthError('Preencha o e-mail e a senha.');
  }
  if (!isValidEmail(email)) throw new AuthError('Informe um e-mail válido.');
}

export function restoreSession() {
  return storageOperation(async () => {
    const id = await SecureStore.getItemAsync(SESSION_KEY);
    if (!id) return null;
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
    const profiles = await readProfiles();
    const profile = profiles.find((item) => item.id === id);
    const credential = profile ? await SecureStore.getItemAsync(credentialKey(id)) : null;
    if (!profile || !credential) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
    return profile;
  });
}

export function loginLocal(email, password) {
  return storageOperation(async () => {
    const normalizedEmail = normalizeEmail(email);
    validateCredentials(normalizedEmail, password);
    const profiles = await readProfiles();
    const profile = profiles.find((item) => item.email === normalizedEmail);
    const credential = profile ? await SecureStore.getItemAsync(credentialKey(profile.id)) : null;
    if (!profile || credential !== password) throw new AuthError('E-mail ou senha incorretos.');
    await SecureStore.setItemAsync(SESSION_KEY, profile.id, secureOptions);
    return profile;
  });
}

export function registerLocal(name, email, password) {
  return storageOperation(async () => {
    const normalizedName = typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : '';
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedName) throw new AuthError('Informe seu nome.');
    validateCredentials(normalizedEmail, password);
    if (password.length < 6) throw new AuthError('A senha deve ter pelo menos 6 caracteres.');
    const profiles = await readProfiles();
    if (profiles.some((item) => item.email === normalizedEmail)) {
      throw new AuthError('Este e-mail já está cadastrado. Entre na sua conta.');
    }
    // Gerado uma única vez, com verificação de colisão na lista local.
    let id;
    do {
      id = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
    } while (profiles.some((item) => item.id === id));
    const profile = { id, name: normalizedName, email: normalizedEmail };
    // Senhas ficam exclusivamente no SecureStore, protegidas pelo dispositivo.
    await SecureStore.setItemAsync(credentialKey(id), password, secureOptions);
    try {
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify([...profiles, profile]));
    } catch (error) {
      await SecureStore.deleteItemAsync(credentialKey(id));
      throw error;
    }
    try {
      await SecureStore.setItemAsync(SESSION_KEY, id, secureOptions);
    } catch {
      throw new AuthError('Conta criada, mas não foi possível iniciar a sessão. Volte ao login para entrar.');
    }
    return profile;
  });
}

export function logoutLocal() {
  return storageOperation(async () => {
    // Mantém perfis e credenciais disponíveis para um novo login.
    await SecureStore.deleteItemAsync(SESSION_KEY);
  });
}
