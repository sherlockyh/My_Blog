// 组件用途：展示文章详情页标题、面包屑、元信息和标签。
import { CalendarOutlined, ClockCircleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ArticleDTO } from '@my-blog/shared';

interface ArticleHeaderProps {
  article: ArticleDTO;
  title: string;
  primaryTag: string;
}

export default function ArticleHeader({ article, title, primaryTag }: ArticleHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="article-detail-head">
      <div className="article-breadcrumb">
        <Link to="/articles">{t('nav.articles')}</Link>
        <span>/</span>
        <Link to={`/articles?tag=${encodeURIComponent(primaryTag)}`}>{primaryTag}</Link>
      </div>
      <h1 className="article-title">{title}</h1>
      <div className="article-meta">
        <span className="article-author-avatar">yh</span>
        <span className="meta">
          <UserOutlined /> yh
        </span>
        <span className="meta">
          <CalendarOutlined /> {dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}
        </span>
        <span className="meta">
          <ClockCircleOutlined /> {t('articles.readingTime')}
        </span>
        <span className="meta">
          <EyeOutlined /> {article.viewCount} {t('home.views')}
        </span>
      </div>
      <div className="project-tags article-detail-tags">
        {article.tags.map((item) => (
          <Link key={item} to={`/articles?tag=${encodeURIComponent(item)}`} className="tag-chip">
            {item}
          </Link>
        ))}
      </div>
    </header>
  );
}
