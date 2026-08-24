// 组件用途：为后台管理区提供 Ant Design 主题配置。
import type { ReactNode } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';

interface AdminThemeProviderProps {
  children: ReactNode;
}

export default function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          colorBgBase: '#ffffff',
          colorTextBase: '#0f172a',
          borderRadius: 8,
        },
        components: {
          Layout: {
            bodyBg: '#f5f8ff',
            headerBg: 'rgba(255, 255, 255, 0.72)',
            siderBg: 'rgba(255, 255, 255, 0.92)',
          },
          Menu: {
            itemBg: 'transparent',
            itemColor: '#536179',
            itemHoverColor: '#2563eb',
            itemSelectedBg: 'rgba(37, 99, 235, 0.12)',
            itemSelectedColor: '#2563eb',
          },
          Table: {
            headerBg: '#f8fbff',
            headerColor: '#334155',
            rowHoverBg: '#f8fbff',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
