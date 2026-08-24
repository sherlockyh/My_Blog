import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@my-blog/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 把稳定大依赖拆成独立缓存块，避免每次业务代码变化都让用户重新下载整包。
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
            return 'react';
          }
          if (id.includes('/echarts/')) return 'echarts';
          if (id.includes('/antd/') || id.includes('/@ant-design/icons/') || id.includes('/@rc-component/') || id.includes('/rc-')) return 'antd';
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
      '/uploads': { target: 'http://localhost:7001', changeOrigin: true },
    },
  },
});
