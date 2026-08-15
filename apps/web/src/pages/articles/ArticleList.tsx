import { useEffect, useState } from 'react';
import { Empty, Input, Pagination, Spin, Tag } from 'antd';
import { CalendarOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ArticleDTO, Paged } from '@my-blog/shared';
import { api } from '../../services/api';
import { pick } from '../../utils/content';

export default function ArticleList() {
  const { t } = useTranslation();
  const [data, setData] = useState<Paged<ArticleDTO> | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.articleTags().then(setTags).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .articles({ page, pageSize: 8, tag: tag || undefined, keyword: keyword || undefined })
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, tag, keyword]);

  return (
    <div className="container section">
      <div className="list-toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={t('articles.search')}
          className="list-search"
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
        <div className="list-tags">
          <Tag className={!tag ? 'tag-active' : ''} onClick={() => { setTag(''); setPage(1); }}>
            {t('articles.all')}
          </Tag>
          {tags.map((x) => (
            <Tag key={x} className={tag === x ? 'tag-active' : ''} onClick={() => { setTag(x); setPage(1); }}>
              {x}
            </Tag>
          ))}
        </div>
      </div>

      <Spin spinning={loading}>
        <div className="article-rows">
          {(data?.items || []).map((a) => (
            <Link to={`/articles/${a.slug}`} key={a.id} className="card article-row">
              <div className="article-row-main">
                <h3>{pick(a.titleZh, a.titleEn)}</h3>
                <p>{pick(a.summaryZh, a.summaryEn)}</p>
                <div className="project-tags" style={{ marginTop: 8 }}>
                  {a.tags.map((x) => (
                    <span key={x} className="tag-chip">{x}</span>
                  ))}
                </div>
              </div>
              <div className="article-row-meta">
                <span className="meta">
                  <CalendarOutlined /> {dayjs(a.publishedAt || a.createdAt).format('YYYY-MM-DD')}
                </span>
                <span className="meta">
                  <EyeOutlined /> {a.viewCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
        {!loading && !data?.items.length && <Empty description={t('articles.empty')} />}
      </Spin>

      {(data?.total || 0) > 8 && (
        <div className="list-pagination">
          <Pagination current={page} pageSize={8} total={data?.total || 0} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
