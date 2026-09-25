// 页面用途：展示公开文章列表、标签筛选和分页。
import { useEffect, useState, type KeyboardEvent } from 'react';
import { Button, Empty, Input, Pagination, Spin, Tag } from 'antd';
import { FileTextOutlined, SearchOutlined, TagsOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { articleApi } from '@/services/article';
import { useRequest } from '@/hooks/useRequest';
import ArticleCard from '@/components/blog/ArticleCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import './styles/index.less';

export default function ArticleList() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: tagsData } = useRequest(() => articleApi.articleTags());
  const tags = tagsData ?? [];
  const [tag, setTag] = useState<string>(searchParams.get('tag') || '');
  const [searchText, setSearchText] = useState(searchParams.get('keyword') || '');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const selectTag = (nextTag: string) => {
    setTag(nextTag);
    setPage(1);
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLElement>, nextTag: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectTag(nextTag);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextKeyword = searchText.trim();
      setKeyword(nextKeyword);
      const next = new URLSearchParams(searchParams);
      if (nextKeyword) next.set('keyword', nextKeyword);
      else next.delete('keyword');
      if (tag) next.set('tag', tag);
      else next.delete('tag');
      // URL 与筛选条件同步，刷新或分享链接时能还原当前列表状态。
      setSearchParams(next, { replace: true });
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText, tag]);

  const {
    data: pageData,
    loading,
    error,
    refresh,
  } = useRequest(
    () =>
      articleApi.articles({
        page,
        pageSize: 8,
        tag: tag || undefined,
        keyword: keyword || undefined,
      }),
    { refreshDeps: [page, tag, keyword] },
  );
  const data = pageData ?? null;

  return (
    <div className="container section blog-module">
      <div className="page-heading page-heading-split">
        <div>
          <span className="article-page-kicker">
            <FileTextOutlined /> {t('nav.articles')}
          </span>
          <h1>{t('articles.title')}</h1>
          <p>{t('articles.subtitle')}</p>
        </div>
        <span className="page-count">
          {data?.total || 0} {t('articles.total')}
        </span>
      </div>

      <div className="blog-layout">
        <div className="blog-main">
          <div className="list-toolbar">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder={t('articles.search')}
              className="list-search"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
            <div className="list-tags">
              <Tag
                className={!tag ? 'tag-active' : ''}
                role="button"
                tabIndex={0}
                onClick={() => selectTag('')}
                onKeyDown={(event) => handleTagKeyDown(event, '')}
              >
                {t('articles.all')}
              </Tag>
              {tags.map((x) => (
                <Tag
                  key={x}
                  className={tag === x ? 'tag-active' : ''}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectTag(x)}
                  onKeyDown={(event) => handleTagKeyDown(event, x)}
                >
                  {x}
                </Tag>
              ))}
            </div>
          </div>
          {(tag || keyword) && (
            <div className="article-filter-hint">
              <TagsOutlined />
              <span>{tag || keyword}</span>
            </div>
          )}

          <Spin spinning={loading}>
            <div className="article-list-rows">
              {(data?.items || []).map((a) => (
                <ArticleCard key={a.id} article={a} variant="row" />
              ))}
            </div>
            {error ? (
              <Empty description={t('common.loadFailed')}>
                <Button onClick={() => void refresh()}>{t('common.retry')}</Button>
              </Empty>
            ) : (
              !loading && !data?.items.length && <Empty description={t('articles.empty')} />
            )}
          </Spin>

          {(data?.total || 0) > 8 && (
            <div className="list-pagination">
              <Pagination current={page} pageSize={8} total={data?.total || 0} onChange={setPage} />
            </div>
          )}
        </div>
        <BlogSidebar tags={tags.slice(0, 12)} />
      </div>
    </div>
  );
}
