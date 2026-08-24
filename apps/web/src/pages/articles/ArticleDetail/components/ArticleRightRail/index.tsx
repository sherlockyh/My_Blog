// 组件用途：展示文章目录、相关文章和标签侧栏。
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ArticleDTO } from '@my-blog/shared';
import { pick } from '@/utils/content';
import type { TocItem } from '../../utils/toc';

interface ArticleRightRailProps {
  toc: TocItem[];
  activeHeadingId: string;
  related: ArticleDTO[];
  tags: string[];
}

export default function ArticleRightRail({ toc, activeHeadingId, related, tags }: ArticleRightRailProps) {
  const { t } = useTranslation();

  return (
    <aside className="article-right-rail">
      <section className="card sidebar-card article-toc-card">
        <h3 className="sidebar-title">{t('articles.toc')}</h3>
        <div className="article-toc">
          {toc.length ? toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`${item.level === 3 ? 'sub' : ''}${activeHeadingId === item.id ? ' active' : ''}`}
            >
              {item.text}
            </a>
          )) : <span>{t('articles.emptyToc')}</span>}
        </div>
      </section>
      <section className="card sidebar-card">
        <h3 className="sidebar-title">{t('articles.related')}</h3>
        <div className="sidebar-latest">
          {related.map((item) => (
            <Link key={item.id} to={`/articles/${item.slug}`}>
              <strong>{pick(item.titleZh, item.titleEn)}</strong>
              <span>{dayjs(item.publishedAt || item.createdAt).format('YYYY-MM-DD')}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="card sidebar-card">
        <h3 className="sidebar-title">{t('articles.articleTags')}</h3>
        <div className="project-tags">
          {tags.map((item) => (
            <Link key={item} to={`/articles?tag=${encodeURIComponent(item)}`} className="tag-chip">
              {item}
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}
