import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * 按环境注入 CSP meta：
 * - connect-src：'self' + 天气组件的 open-meteo 域名；开发环境额外放行 vite dev server；
 *   可用 VITE_CSP_CONNECT_SRC（逗号分隔）追加跨域 API
 * - img-src：默认 data:/https:；dev 额外放行本地 MinIO，生产 http 源用 VITE_CSP_IMG_SRC 覆盖
 */
function injectCsp(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  const extraConnect = (env.VITE_CSP_CONNECT_SRC || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const connectSrc = [
    "'self'",
    'https://api.open-meteo.com',
    'https://geocoding-api.open-meteo.com',
    ...(isProd ? [] : ['http://localhost:5173', 'ws://localhost:5173']),
    ...extraConnect,
  ];
  // dev 默认放行本地 MinIO（S3_PUBLIC_BASE_URL 默认 http://localhost:9000），
  // 生产若用 https: 之外的图片源需 VITE_CSP_IMG_SRC 覆盖
  const imgSrc =
    env.VITE_CSP_IMG_SRC ||
    (isProd ? "'self' data: https:" : "'self' data: https: http://localhost:9000");
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(' ')}`,
  ].join('; ');

  return {
    name: 'inject-csp',
    transformIndexHtml(html) {
      return html.replace(
        /<!--\s*csp-meta-placeholder.*?-->/,
        `<meta http-equiv="Content-Security-Policy" content="${csp}" />`,
      );
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), injectCsp(mode)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@my-blog/shared': fileURLToPath(
        new URL('../../packages/shared/src/index.ts', import.meta.url),
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 把稳定大依赖拆成独立缓存块，避免每次业务代码变化都让用户重新下载整包。
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'react';
          }
          if (id.includes('/echarts/')) return 'echarts';
          if (
            id.includes('/antd/') ||
            id.includes('/@ant-design/icons/') ||
            id.includes('/@rc-component/') ||
            id.includes('/rc-')
          )
            return 'antd';
          if (
            id.includes('/@uiw/react-md-editor/') ||
            id.includes('/@codemirror/') ||
            id.includes('/codemirror/') ||
            id.includes('/@lezer/') ||
            id.includes('/style-mod/') ||
            id.includes('/w3c-keyname/')
          ) {
            return 'markdown-editor';
          }
          if (
            id.includes('/react-markdown/') ||
            id.includes('/remark-gfm/') ||
            id.includes('/unified/') ||
            id.includes('/micromark') ||
            id.includes('/mdast-util') ||
            id.includes('/hast-util') ||
            id.includes('/remark-parse/') ||
            id.includes('/remark-rehype/')
          ) {
            return 'markdown-render';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:7001', changeOrigin: true },
    },
  },
}));
