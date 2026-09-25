// 组件用途：展示博客侧边栏的作者、最新文章和标签信息。
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { articleApi } from '@/services/article';
import { useRequest } from '@/hooks/useRequest';
import { useSiteStore } from '@/store/site';
import { pick } from '@/utils/content';
import './styles/index.less';

interface BlogSidebarProps {
  currentSlug?: string;
  tags?: string[];
}

export default function BlogSidebar({ currentSlug, tags: initialTags }: BlogSidebarProps) {
  const { t } = useTranslation();
  const profile = useSiteStore((s) => s.site?.profile);
  // 侧栏只取轻量列表字段，既补齐模块信息，也避免把文章正文拉进公共页面侧栏。
  const { data: latestData } = useRequest(
    async () =>
      (await articleApi.articles({ pageSize: 5 })).items
        .filter((item) => item.slug !== currentSlug)
        .slice(0, 4),
    { refreshDeps: [currentSlug] },
  );
  const latest = latestData ?? [];
  // 外部已传入标签时跳过请求
  const { data: tagsData } = useRequest(async () => (await articleApi.articleTags()).slice(0, 12), {
    manual: !!initialTags?.length,
  });
  const tags = initialTags?.length ? initialTags : (tagsData ?? []);

  return (
    <aside className="blog-sidebar">
      <section className="card about-card sidebar-card">
        <h3 className="sidebar-title">
          <UserOutlined /> {t('home.aboutMe')}
        </h3>
        <div className="about-avatar">
          <img src={profile?.avatar || '/images/avatar.svg'} alt={profile?.name || 'yh'} />
        </div>
        <p className="about-bio">{pick(profile?.bioZh, profile?.bioEn)}</p>
        {profile?.location && (
          <p className="meta">
            <EnvironmentOutlined /> {profile.location}
          </p>
        )}
        <Link to="/about" className="article-more">
          {t('common.learnMore')}
        </Link>
      </section>

      <section className="card sidebar-card">
        <h3 className="sidebar-title">
          <ClockCircleOutlined /> {t('home.latest')}
        </h3>
        <div className="sidebar-latest">
          {latest.map((article) => (
            <Link key={article.id} to={`/articles/${article.slug}`}>
              <strong>{pick(article.titleZh, article.titleEn)}</strong>
              <span>{dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card sidebar-card">
        <h3 className="sidebar-title">
          <TagsOutlined /> {t('home.hotTags')}
        </h3>
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
