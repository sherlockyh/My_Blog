export type Theme = 'light' | 'dark';

/** 在加载 React 前恢复主题，使背景图预加载和页面首次显示保持一致。 */
function readInitialTheme(): Theme {
  try {
    return localStorage.getItem('blog-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export const initialTheme = readInitialTheme();
