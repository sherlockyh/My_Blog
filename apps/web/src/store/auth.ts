import { create } from 'zustand';

interface AuthState {
  token: string;
  setToken: (t: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('blog-token') || '',
  setToken: (token) => {
    localStorage.setItem('blog-token', token);
    set({ token });
  },
  clear: () => {
    localStorage.removeItem('blog-token');
    set({ token: '' });
  },
}));
