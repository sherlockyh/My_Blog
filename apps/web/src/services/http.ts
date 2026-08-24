import axios from 'axios';
import { useAuthStore } from '@/store/auth';

export const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE || '/api' });

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** 服务端统一 { code, data, message }，这里解包出 data */
http.interceptors.response.use(
  (res) => (res.data && typeof res.data === 'object' && 'code' in res.data ? res.data.data : res.data),
  (err) => {
    const status = err.response?.status;
    if (status === 401 && window.location.pathname.startsWith('/admin')) {
      useAuthStore.getState().clear();
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  },
);

export const request = {
  get: <T>(url: string, config?: Parameters<typeof http.get>[1]) => http.get<unknown, T>(url, config),
  post: <T>(url: string, data?: unknown, config?: Parameters<typeof http.post>[2]) =>
    http.post<unknown, T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: Parameters<typeof http.put>[2]) =>
    http.put<unknown, T>(url, data, config),
  delete: <T>(url: string, config?: Parameters<typeof http.delete>[1]) => http.delete<unknown, T>(url, config),
};
