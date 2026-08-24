// 组件用途：根据筛选配置渲染后台列表筛选区。
import { Button, Input, Select } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

export type FilterValue = string | number | boolean | undefined;
export type FilterValues = Record<string, FilterValue>;

export interface FilterOption {
  label: ReactNode;
  value: string | number | boolean;
}

export interface FilterField {
  key: string;
  label: ReactNode;
  type: 'input' | 'select';
  placeholder?: string;
  allowClear?: boolean;
  options?: FilterOption[];
}

interface FilterBarProps {
  fields: FilterField[];
  values: FilterValues;
  searchText: ReactNode;
  resetText: ReactNode;
  onChange: (key: string, value: FilterValue) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function FilterBar({ fields, values, searchText, resetText, onChange, onSearch, onReset }: FilterBarProps) {
  if (!fields.length) return null;

  return (
    <div className="admin-filter-bar">
      {fields.map((field) => (
        <div className="admin-filter-item" key={field.key}>
          <label>{field.label}</label>
          {field.type === 'input' ? (
            <Input
              value={(values[field.key] as string | undefined) ?? ''}
              placeholder={field.placeholder}
              allowClear={field.allowClear}
              onChange={(event) => onChange(field.key, event.target.value)}
              onPressEnter={onSearch}
            />
          ) : (
            <Select
              value={values[field.key]}
              allowClear={field.allowClear}
              placeholder={field.placeholder}
              onChange={(value) => onChange(field.key, value)}
              options={field.options}
            />
          )}
        </div>
      ))}
      <div className="admin-filter-actions">
        <Button type="primary" icon={<SearchOutlined />} className="btn-gradient" onClick={onSearch}>
          {searchText}
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onReset}>
          {resetText}
        </Button>
      </div>
    </div>
  );
}
