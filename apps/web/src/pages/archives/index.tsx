// 页面用途：按时间线展示公开文章归档。
import { useEffect, useMemo, useState } from 'react';
import { CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ArticleDTO } from '@my-blog/shared';
import { articleApi } from '@/services/article';
import { pick } from '@/utils/content';
import './styles/index.module.less';

export default function Archives() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    articleApi.articles({ pageSize: 50 }).then((res) => setArticles(res.items)).catch(() => setArticles([])).finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    // 归档页是公开文章的纯展示派生数据，不再单独维护一份年份配置。
    return articles.reduce<Record<string, ArticleDTO[]>>((acc, article) => {
      const key = dayjs(article.publishedAt || article.createdAt).format('YYYY');
      (acc[key] ||= []).push(article);
      return acc;
    }, {});
  }, [articles]);

  return (
    <div className="container section blog-module">
      <div className="page-heading">
        <h1>{t('archives.title')}</h1>
        <p>{t('archives.subtitle')}</p>
      </div>
      <Spin spinning={loading}>
        {!loading && !articles.length && <Empty description={t('articles.empty')} />}
        <div className="archive-list">
          {Object.entries(groups).map(([year, items]) => (
            <section key={year} className="archive-year card">
              <h2>{year}</h2>
              <div className="archive-items">
                {items.map((article) => (
                  <Link key={article.id} to={`/articles/${article.slug}`} className="archive-item">
                    <span className="archive-date">
                      <CalendarOutlined /> {dayjs(article.publishedAt || article.createdAt).format('MM-DD')}
                    </span>
                    <strong>{pick(article.titleZh, article.titleEn)}</strong>
                    <span className="meta">
                      <EyeOutlined /> {article.viewCount}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Spin>
    </div>
  );
}
