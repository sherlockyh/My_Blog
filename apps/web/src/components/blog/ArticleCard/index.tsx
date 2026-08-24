// 组件用途：展示公开文章列表中的文章卡片。
import { ArrowRightOutlined, CalendarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import type { ArticleDTO } from '@my-blog/shared';
import ArticleCoverFallback from '@/components/blog/ArticleCoverFallback';
import { pick } from '@/utils/content';
import './styles/index.module.less';

interface ArticleCardProps {
  article: ArticleDTO;
  variant?: 'featured' | 'row';
}

const TAG_STYLE_KEYS = ['frontend', 'react', 'typescript', 'node', 'design', 'tool'];

export default function ArticleCard({ article, variant = 'featured' }: ArticleCardProps) {
  const title = pick(article.titleZh, article.titleEn);
  const summary = pick(article.summaryZh, article.summaryEn);
  const date = dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD');
  const primaryTag = article.tags[0] || 'Code';
  const tagStyleKey = TAG_STYLE_KEYS[article.id % TAG_STYLE_KEYS.length];

  return (
    <Link to={`/articles/${article.slug}`} className={`card blog-article-card blog-article-card-${variant}`}>
      <div className={`blog-article-cover blog-cover-${tagStyleKey}`}>
        {article.cover ? (
          <img src={article.cover} alt={title} loading="lazy" />
        ) : (
          // 没有上传封面时生成稳定的科技感封面，保证列表和首页不会出现空白卡片。
          <ArticleCoverFallback label={primaryTag} />
        )}
        <span className="project-badge">{primaryTag}</span>
      </div>
      <div className="blog-article-body">
        <div className="blog-article-tags">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
        <h3>{title}</h3>
        <p>{summary}</p>
        <div className="blog-article-meta">
          <span>
            <UserOutlined /> yh
          </span>
          <span>
            <CalendarOutlined /> {date}
          </span>
          <span>
            <EyeOutlined /> {article.viewCount}
          </span>
          <span className="article-read-more">
            <ArrowRightOutlined />
          </span>
        </div>
      </div>
    </Link>
  );
}
