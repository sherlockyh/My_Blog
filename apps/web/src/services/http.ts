import axios from 'axios';
import { useAuthStore } from '../store/auth';

export const http = axios.create({ baseURL: '/api' });

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
