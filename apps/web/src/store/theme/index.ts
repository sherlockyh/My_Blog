import { create } from 'zustand';
import { initialTheme, type Theme } from './initialTheme';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggle: () =>
    set((state) => {
      const theme: Theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('blog-theme', theme);
      return { theme };
    }),
  setTheme: (theme) => {
    localStorage.setItem('blog-theme', theme);
    set({ theme });
  },
}));
