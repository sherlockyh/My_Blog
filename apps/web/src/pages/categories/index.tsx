// 页面用途：按分类聚合展示公开文章。
import { useMemo } from 'react';
import { AppstoreOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Button, Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ArticleDTO } from '@my-blog/shared';
import { articleApi } from '@/services/article';
import { useRequest } from '@/hooks/useRequest';
import { pick } from '@/utils/content';
import './styles/index.less';

export default function Categories() {
  const { t } = useTranslation();
  const { data, loading, error, refresh } = useRequest(() => articleApi.allPublished());
  const articles = data?.items ?? [];

  const groups = useMemo(() => {
    // 当前数据模型没有独立分类表，先用文章首个标签作为主分类，后续可无痛替换为 category 字段。
    return articles.reduce<Record<string, ArticleDTO[]>>((acc, article) => {
      const key = article.tags[0] || t('categories.uncategorized');
      (acc[key] ||= []).push(article);
      return acc;
    }, {});
  }, [articles, t]);

  return (
    <div className="container section blog-module">
      <div className="page-heading">
        <h1>{t('categories.title')}</h1>
        <p>{t('categories.subtitle')}</p>
      </div>
      <Spin spinning={loading}>
        {error ? (
          <Empty description={t('common.loadFailed')}>
            <Button onClick={() => void refresh()}>{t('common.retry')}</Button>
          </Empty>
        ) : (
          !loading && !articles.length && <Empty description={t('articles.empty')} />
        )}
        <div className="category-grid">
          {Object.entries(groups).map(([category, items]) => (
            <section key={category} className="card category-card">
              <h2>
                <AppstoreOutlined /> {category}
              </h2>
              <p>{t('categories.articleCount', { count: items.length })}</p>
              <div className="category-links">
                {items.slice(0, 5).map((article) => (
                  <Link key={article.id} to={`/articles/${article.slug}`}>
                    <FileTextOutlined /> {pick(article.titleZh, article.titleEn)}
                  </Link>
                ))}
              </div>
              <Link to={`/articles?tag=${encodeURIComponent(category)}`} className="category-more">
                {t('common.view')}
              </Link>
            </section>
          ))}
        </div>
      </Spin>
    </div>
  );
}
