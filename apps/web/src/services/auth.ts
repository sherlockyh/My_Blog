import { request } from './http';

export const authApi = {
  login: (body: { username: string; password: string }) => request.post<{ token: string }>('/auth/login', body),
};
