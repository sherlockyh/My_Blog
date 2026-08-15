import { useEffect, useState } from 'react';
import { CalendarOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ArticleDTO } from '@my-blog/shared';
import { api } from '../../services/api';
import { pick } from '../../utils/content';

export default function LatestArticles() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<ArticleDTO[]>([]);

  useEffect(() => {
    api.articles({ pageSize: 4 }).then((res) => setArticles(res.items)).catch(() => {});
  }, []);

  if (!articles.length) return null;

  return (
    <section className="container section">
      <div className="section-header">
        <h2 className="section-title">
          <FileTextOutlined /> {t('home.latest')}
        </h2>
        <Link to="/articles" className="view-all">
          {t('home.viewAll')} →
        </Link>
      </div>
      <div className="article-rows">
        {articles.map((a) => (
          <Link to={`/articles/${a.slug}`} key={a.id} className="card article-row">
            <div className="article-row-main">
              <h3>{pick(a.titleZh, a.titleEn)}</h3>
              <p>{pick(a.summaryZh, a.summaryEn)}</p>
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
    </section>
  );
}
