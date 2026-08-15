import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('blog-theme') as Theme) || 'light',
  toggle: () => set((state) => {
    const theme: Theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('blog-theme', theme);
    return { theme };
  }),
  setTheme: (theme) => {
    localStorage.setItem('blog-theme', theme);
    set({ theme });
  },
}));
