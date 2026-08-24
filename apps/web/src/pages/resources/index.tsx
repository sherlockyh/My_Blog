// 页面用途：展示公开资源列表、分类和搜索筛选。
import { useEffect, useState } from 'react';
import { Empty, Input, Tag } from 'antd';
import { LinkOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ResourceDTO } from '@my-blog/shared';
import { resourceApi } from '@/services/resource';
import { pick } from '@/utils/content';
import './styles/index.module.less';

export default function Resources() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<ResourceDTO[]>([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    resourceApi.resources().then(setResources).catch(() => {});
  }, []);

  const categories = [...new Set(resources.map((resource) => resource.category || 'Other'))];
  const filtered = resources.filter((resource) => {
    const text = [resource.titleZh, resource.titleEn, resource.descZh, resource.descEn, resource.category].join(' ').toLowerCase();
    const currentCategory = resource.category || 'Other';
    return (!keyword || text.includes(keyword.toLowerCase())) && (!category || currentCategory === category);
  });
  const groups = filtered.reduce<Record<string, ResourceDTO[]>>((acc, r) => {
    const key = r.category || 'Other';
    (acc[key] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div className="container section">
      <div className="page-heading">
        <h1>{t('resources.title')}</h1>
        <p>{t('resources.subtitle')}</p>
      </div>
      <div className="list-toolbar">
        <Input allowClear prefix={<SearchOutlined />} placeholder={t('resources.search')} className="list-search" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <div className="list-tags">
          <Tag className={!category ? 'tag-active' : ''} onClick={() => setCategory('')}>{t('resources.all')}</Tag>
          {categories.map((item) => (
            <Tag key={item} className={category === item ? 'tag-active' : ''} onClick={() => setCategory(item)}>{item}</Tag>
          ))}
        </div>
      </div>
      {Object.entries(groups).map(([category, items]) => (
        <div key={category} className="resource-group">
          <h3 className="resource-category">{category}</h3>
          <div className="resource-grid">
            {items.map((r) => (
              <a key={r.id} className="card resource-card" href={r.link} target="_blank" rel="noreferrer">
                <h4>
                  <LinkOutlined /> {pick(r.titleZh, r.titleEn)}
                </h4>
                <p>{pick(r.descZh, r.descEn)}</p>
              </a>
            ))}
          </div>
        </div>
      ))}
      {!filtered.length && <Empty description={t('resources.empty')} />}
    </div>
  );
}
