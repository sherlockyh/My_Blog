import { useCallback, useEffect, useRef, useState } from 'react';
import type { Paged } from '@my-blog/shared';

export interface UsePagedListResult<T> {
  data: Paged<T> | null;
  page: number;
  pageSize: number;
  loading: boolean;
  loadFailed: boolean;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  /** 命令式重载（删除/保存后调用），默认沿用当前页 */
  reload: (nextPage?: number, nextPageSize?: number) => Promise<void>;
}

/**
 * admin 列表页的命令式分页加载收敛：data/page/pageSize/loading/loadFailed 五件套
 * + 翻页自动重查 + 删除/保存后手动 reload。fetcher 始终读取最新闭包，
 * 筛选条件变化可通过 extraDeps 触发重查。
 */
export function usePagedList<T>(
  fetcher: (page: number, pageSize: number) => Promise<Paged<T>>,
  extraDeps: unknown[] = [],
): UsePagedListResult<T> {
  const [data, setData] = useState<Paged<T> | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const fetcherRef = useRef(fetcher);
  const mountedRef = useRef(true);
  useEffect(() => {
    fetcherRef.current = fetcher;
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, [fetcher]);

  const reload = useCallback(
    async (nextPage = page, nextPageSize = pageSize) => {
      setLoading(true);
      setLoadFailed(false);
      try {
        const res = await fetcherRef.current(nextPage, nextPageSize);
        if (mountedRef.current) setData(res);
      } catch {
        if (mountedRef.current) setLoadFailed(true);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    // 页码变化时重建，供 effect 感知；筛选条件经 fetcherRef 读取最新值

    [page, pageSize],
  );

  const extraKey = JSON.stringify(extraDeps);
  useEffect(() => {
    void reload();
  }, [reload, extraKey]);

  return { data, page, pageSize, loading, loadFailed, setPage, setPageSize, reload };
}
