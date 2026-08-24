// 组件用途：捕获前端运行时错误并展示兜底界面。
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 线上可接入 Sentry/日志平台；先保留控制台输出，避免吞掉 chunk 加载失败等关键线索。
    console.error('[ui-error-boundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container section">
        <Result
          status="500"
          title="页面加载失败"
          subTitle="请刷新页面重试，或稍后再访问。"
          extra={
            <Button type="primary" className="btn-gradient" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          }
        />
      </div>
    );
  }
}
