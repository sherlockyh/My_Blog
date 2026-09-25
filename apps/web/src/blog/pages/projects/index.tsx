// 页面用途：展示公开项目列表和关键词筛选。
import { useState } from 'react';
import { Button, Empty, Input, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { projectApi } from '@/services/project';
import { useRequest } from '@/hooks/useRequest';
import ProjectCard from '@/blog/components/ProjectCard';
import './styles/index.less';

export default function Projects() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [tag, setTag] = useState('');
  const { data, error, refresh } = useRequest(() => projectApi.projects());
  const projects = data ?? [];

  const tags = [...new Set(projects.flatMap((project) => project.tags))];
  const filtered = projects.filter((project) => {
    const text = [
      project.titleZh,
      project.titleEn,
      project.descZh,
      project.descEn,
      project.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase();
    return (
      (!keyword || text.includes(keyword.toLowerCase())) && (!tag || project.tags.includes(tag))
    );
  });

  return (
    <div className="container section">
      <div className="page-heading">
        <h1>{t('projects.title')}</h1>
        <p>{t('projects.subtitle')}</p>
      </div>
      <div className="list-toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={t('projects.search')}
          className="list-search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className="list-tags">
          <Tag className={!tag ? 'tag-active' : ''} onClick={() => setTag('')}>
            {t('projects.all')}
          </Tag>
          {tags.map((item) => (
            <Tag
              key={item}
              className={tag === item ? 'tag-active' : ''}
              onClick={() => setTag(item)}
            >
              {item}
            </Tag>
          ))}
        </div>
      </div>
      <div className="projects-grid">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      {error ? (
        <Empty description={t('common.loadFailed')}>
          <Button onClick={() => void refresh()}>{t('common.retry')}</Button>
        </Empty>
      ) : (
        !filtered.length && <Empty description={t('projects.empty')} />
      )}
    </div>
  );
}
