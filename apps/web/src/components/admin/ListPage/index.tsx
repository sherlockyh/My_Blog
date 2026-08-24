// 组件用途：封装后台列表页的头部、筛选、错误提示和表格骨架。
import { Table } from 'antd';
import type { ReactNode } from 'react';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { Key } from 'antd/es/table/interface';
import AdminLoadError from '@/components/admin/AdminLoadError';
import FilterBar, { type FilterField, type FilterValue, type FilterValues } from './components/FilterBar';
import './styles/index.module.less';

interface ListPageProps<T extends object> {
  className?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  stats?: ReactNode;
  filters?: FilterField[];
  filterValues?: FilterValues;
  searchText?: ReactNode;
  resetText?: ReactNode;
  onFilterChange?: (key: string, value: FilterValue) => void;
  onSearch?: () => void;
  onReset?: () => void;
  loadFailed?: boolean;
  onRetry?: () => void;
  rowKey: string | ((record: T) => Key);
  loading?: boolean;
  dataSource: T[];
  columns: ColumnsType<T>;
  pagination?: false | TablePaginationConfig;
  scroll?: { x?: number | string | true; y?: number | string };
}

export default function ListPage<T extends object>({
  className = '',
  title,
  description,
  actions,
  stats,
  filters = [],
  filterValues = {},
  searchText,
  resetText,
  onFilterChange,
  onSearch,
  onReset,
  loadFailed,
  onRetry,
  rowKey,
  loading,
  dataSource,
  columns,
  pagination,
  scroll,
}: ListPageProps<T>) {
  return (
    <div className={`admin-page admin-list-page ${className}`.trim()}>
      <div className="admin-page-head">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions}
      </div>

      {stats}

      <FilterBar
        fields={filters}
        values={filterValues}
        searchText={searchText}
        resetText={resetText}
        onChange={(key, value) => onFilterChange?.(key, value)}
        onSearch={() => onSearch?.()}
        onReset={() => onReset?.()}
      />

      {loadFailed && onRetry && <AdminLoadError onRetry={onRetry} />}

      <Table<T>
        className="admin-table"
        rowKey={rowKey}
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        scroll={scroll}
        columns={columns}
      />
    </div>
  );
}

export type { FilterField, FilterValue, FilterValues };
