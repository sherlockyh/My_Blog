import { initialTheme } from './store/theme/initialTheme';
import heroLight from './assets/hero/hero-bg-light.webp';
import heroDark from './assets/hero/hero-bg-dark.webp';
import heroLightMobile from './assets/hero/hero-bg-light-mobile.webp';
import heroDarkMobile from './assets/hero/hero-bg-dark-mobile.webp';
import './styles/variables.css';
import './styles/global.css';

document.documentElement.dataset.theme = initialTheme;

// 首屏背景先于 React 和组件库下载；其他页面不预加载首页图片。
if (window.location.pathname === '/') {
  const mobile = window.matchMedia('(max-width: 640px)').matches;
  const backgrounds = {
    light: mobile ? heroLightMobile : heroLight,
    dark: mobile ? heroDarkMobile : heroDark,
  };
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'image';
  preload.type = 'image/webp';
  preload.href = backgrounds[initialTheme];
  preload.setAttribute('fetchpriority', 'high');
  document.head.appendChild(preload);
}

void import('./main');
