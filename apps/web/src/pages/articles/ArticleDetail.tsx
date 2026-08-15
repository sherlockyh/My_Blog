import { useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ArticleDTO } from '@my-blog/shared';
import { api } from '../../services/api';
import { pick } from '../../utils/content';
import { useThemeStore } from '../../store/theme';
import '../../styles/article.css';

export default function ArticleDetail() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const [article, setArticle] = useState<ArticleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .article(slug)
      .then(setArticle)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="container section">
        <Result
          status="404"
          title="404"
          subTitle={t('articles.empty')}
          extra={
            <Link to="/articles">
              <Button type="primary">{t('articles.back')}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const content = pick(article.contentZh, article.contentEn);

  return (
    <div className="container section article-detail">
      <Link to="/articles" className="meta" style={{ marginBottom: 16, display: 'inline-flex' }}>
        <ArrowLeftOutlined /> {t('articles.back')}
      </Link>
      <h1 className="article-title">{pick(article.titleZh, article.titleEn)}</h1>
      <div className="article-meta">
        <span className="meta">
          <CalendarOutlined /> {t('articles.publishedAt')} {dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}
        </span>
        <span className="meta">
          <EyeOutlined /> {article.viewCount} {t('home.views')}
        </span>
        <span className="project-tags">
          {article.tags.map((x) => (
            <span key={x} className="tag-chip">{x}</span>
          ))}
        </span>
      </div>
      <div className={`markdown-body${theme === 'dark' ? ' dark' : ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
