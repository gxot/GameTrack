import axios from 'axios';

const apiKey = (process.env.EXPO_PUBLIC_RAWG_API_KEY || '').trim();

export class RawgError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'RawgError';
    this.code = code;
  }
}

export function isRequestCanceled(error) {
  return axios.isCancel(error) || error?.code === 'ERR_CANCELED';
}

const api = axios.create({
  baseURL: 'https://api.rawg.io/api',
  timeout: 15000,
  params: { key: apiKey },
});

api.interceptors.request.use((config) => {
  // O bloqueio acontece antes de qualquer envio pela rede.
  if (!apiKey || apiKey === 'SUA_CHAVE_RAWG_AQUI') {
    throw new RawgError(
      'Configure EXPO_PUBLIC_RAWG_API_KEY no arquivo .env com sua chave RAWG, reinicie o aplicativo e tente novamente.',
      'API_KEY_MISSING'
    );
  }
  config.params = { ...config.params, key: apiKey };
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isRequestCanceled(error) || error instanceof RawgError) return Promise.reject(error);
    // Não propaga config, URL ou mensagem bruta do Axios, que podem conter a chave.
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return Promise.reject(new RawgError('A chave RAWG não foi aceita. Confira a configuração no .env e reinicie o aplicativo.', 'API_KEY_INVALID'));
    }
    if (status === 429) {
      return Promise.reject(new RawgError('O limite de consultas à RAWG foi atingido. Aguarde um pouco e tente novamente.', 'RATE_LIMIT'));
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return Promise.reject(new RawgError('A consulta demorou mais que o esperado. Tente novamente.', 'TIMEOUT'));
    }
    return Promise.reject(new RawgError(
      status ? 'A RAWG está indisponível no momento. Tente novamente.' : 'Não foi possível conectar à RAWG. Confira sua conexão e tente novamente.',
      'REQUEST_FAILED'
    ));
  }
);

export default api;
