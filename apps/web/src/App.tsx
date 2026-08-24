// 根组件用途：挂载全局路由和错误边界。
import { Suspense, useEffect } from 'react';
import { ConfigProvider, Spin, theme as antTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from './store/theme';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './router';

export default function App() {
  const mode = useThemeStore((s) => s.theme);
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <ConfigProvider
      locale={i18n.language === 'en' ? enUS : zhCN}
      theme={{
        algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: '#1890ff', borderRadius: 8 },
      }}
    >
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="container section route-loading">
              <Spin size="large" />
            </div>
          }
        >
          <AppRoutes />
        </Suspense>
      </ErrorBoundary>
    </ConfigProvider>
  );
}
