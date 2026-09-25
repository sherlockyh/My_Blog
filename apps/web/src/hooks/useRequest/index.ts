import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseRequestResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  /** 手动重跑（携带最新闭包），可传给重试按钮 */
  refresh: () => Promise<void>;
}

export interface UseRequestOptions {
  /** 手动模式：不自动请求，只暴露 refresh */
  manual?: boolean;
  /** 依赖变化时自动重新请求 */
  refreshDeps?: unknown[];
}

/**
 * 统一的数据请求 hook：收敛 useEffect + loading + catch 样板。
 * 失败不再静默吞成空数组——通过 error 暴露给页面渲染「加载失败 + 重试」，
 * 避免接口故障被误读成"没有数据"。
 */
export function useRequest<T>(
  fetcher: () => Promise<T>,
  options: UseRequestOptions = {},
): UseRequestResult<T> {
  const { manual = false, refreshDeps = [] } = options;
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState<Error | null>(null);

  // 永远调用最新的 fetcher 闭包，避免 effect 因函数身份变化而重跑；
  // ref 的写入必须放在 effect 里（渲染期写 ref 会破坏并发渲染的一致性）
  const fetcherRef = useRef(fetcher);
  const mountedRef = useRef(true);
  useEffect(() => {
    fetcherRef.current = fetcher;
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, [fetcher]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // 序列化成稳定 key，既响应依赖变化又不触发 exhaustive-deps 告警
  const refreshKey = JSON.stringify(refreshDeps);
  useEffect(() => {
    if (!manual) void refresh();
  }, [manual, refresh, refreshKey]);

  return { data, loading, error, refresh };
}
