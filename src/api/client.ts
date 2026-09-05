import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { TokenPair } from './types';
import { getApiBaseUrl } from './config';

export const ACCESS_TOKEN_KEY = 'bmap_access_token';
export const REFRESH_TOKEN_KEY = 'bmap_refresh_token';

// In-memory fallback
const inMemoryStorage = new Map<string, string>();

export async function getStoredItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      return inMemoryStorage.get(key) || null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return inMemoryStorage.get(key) || null;
  }
}

export async function setStoredItem(key: string, value: string): Promise<void> {
  inMemoryStorage.set(key, value);
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {}
}

export async function removeStoredItem(key: string): Promise<void> {
  inMemoryStorage.delete(key);
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

export async function saveAuthTokens(tokens: TokenPair): Promise<void> {
  await setStoredItem(ACCESS_TOKEN_KEY, tokens.access_token);
  await setStoredItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export async function clearAuthTokens(): Promise<void> {
  await removeStoredItem(ACCESS_TOKEN_KEY);
  await removeStoredItem(REFRESH_TOKEN_KEY);
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Update baseURL dynamically when host changes
export function updateClientBaseUrl(): void {
  apiClient.defaults.baseURL = getApiBaseUrl();
}

// 1. Request Interceptor: Attach Bearer Access Token
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Always ensure current baseURL is in sync
  config.baseURL = getApiBaseUrl();
  const token = await getStoredItem(ACCESS_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Transparent Refresh Queue on 401 Unauthorized
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await getStoredItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post<{ data: { tokens: TokenPair } }>(
          `${getApiBaseUrl()}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access_token, refresh_token: newRefreshToken } = refreshResponse.data.data.tokens;
        await saveAuthTokens({
          access_token,
          refresh_token: newRefreshToken,
          token_type: 'Bearer',
          expires_in: 259200,
          expires_at: '',
        });

        apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        await clearAuthTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
