// 页面用途：展示公开文章详情、阅读进度、目录和相关文章。
import { useEffect, useMemo, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ArticleDTO } from '@my-blog/shared';
import { articleApi } from '@/services/article';
import { pick } from '@/utils/content';
import { useThemeStore } from '@/store/theme';
import ArticleBody from './components/ArticleBody';
import ArticleHeader from './components/ArticleHeader';
import ArticleLeftRail from './components/ArticleLeftRail';
import ArticleRightRail from './components/ArticleRightRail';
import BackTopButton from './components/BackTopButton';
import { getToc } from './utils/toc';
import './styles/index.module.less';

export default function ArticleDetail() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const [article, setArticle] = useState<ArticleDTO | null>(null);
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [leftRailCollapsed, setLeftRailCollapsed] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const content = article ? pick(article.contentZh, article.contentEn) : '';
  const title = article ? pick(article.titleZh, article.titleEn) : '';
  const summary = article ? pick(article.summaryZh, article.summaryEn) : '';
  const primaryTag = article?.tags[0] || 'Code';
  const toc = useMemo(() => getToc(content || ''), [content]);
  const related = article ? articles.filter((item) => item.slug !== article.slug).slice(0, 4) : [];
  const articleTreeValue = article ? `${primaryTag}::${article.slug}` : undefined;
  const articleTags = Array.from(new Set(articles.flatMap((item) => item.tags)));
  const articleTreeData = articleTags.map((tagItem) => {
    const tagArticles = articles.filter((item) => item.tags.includes(tagItem));
    return {
      title: `${tagItem} (${tagArticles.length || 1})`,
      value: `category::${tagItem}`,
      selectable: false,
      children: tagArticles.map((item) => ({
        title: pick(item.titleZh, item.titleEn),
        value: `${tagItem}::${item.slug}`,
      })),
    };
  });

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    articleApi
      .article(slug)
      .then(setArticle)
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    let ignore = false;
    articleApi
      .articles({ pageSize: 50 })
      .then((res) => {
        if (!ignore) setArticles(res.items);
      })
      .catch(() => {
        if (!ignore) setArticles([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const articleElement = document.querySelector<HTMLElement>('.article-detail');
      if (!articleElement) return;
      const rect = articleElement.getBoundingClientRect();
      const readableHeight = Math.max(articleElement.scrollHeight - window.innerHeight * 0.65, 1);
      const scrolled = Math.min(Math.max(-rect.top + 88, 0), readableHeight);
      setReadingProgress(Math.round((scrolled / readableHeight) * 100));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [article?.slug]);

  useEffect(() => {
    if (!toc.length) {
      setActiveHeadingId('');
      return;
    }

    setActiveHeadingId(toc[0].id);
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((item): item is HTMLElement => Boolean(item));
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActiveHeadingId(visible.target.id);
      },
      { rootMargin: '-96px 0px -68% 0px', threshold: [0, 1] },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

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

  return (
    <div className="container section blog-module article-detail-page">
      <div className="article-reading-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${readingProgress / 100})` }} />
      </div>
      <div className={`article-reading-layout${leftRailCollapsed ? ' left-rail-collapsed' : ''}`}>
        <ArticleLeftRail
          collapsed={leftRailCollapsed}
          treeValue={articleTreeValue}
          treeData={articleTreeData}
          onExpand={() => setLeftRailCollapsed(false)}
          onCollapse={() => setLeftRailCollapsed(true)}
          onSelectArticle={(nextSlug) => {
            if (nextSlug !== article.slug) navigate(`/articles/${nextSlug}`);
          }}
        />

        <article className="article-detail">
          <ArticleHeader article={article} title={title} primaryTag={primaryTag} />
          <ArticleBody
            title={title}
            primaryTag={primaryTag}
            cover={article.cover}
            summary={summary}
            content={content}
            theme={theme}
            toc={toc}
          />
        </article>

        <ArticleRightRail toc={toc} activeHeadingId={activeHeadingId} related={related} tags={article.tags} />
      </div>
      <BackTopButton visible={readingProgress > 8} />
    </div>
  );
}
