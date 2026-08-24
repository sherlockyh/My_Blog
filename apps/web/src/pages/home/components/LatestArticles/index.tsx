// 组件用途：展示首页最新文章和个人简介摘要。
import { useEffect, useState } from 'react';
import {
  CalendarOutlined,
  CodeOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  GithubOutlined,
  HeartOutlined,
  LinkOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ArticleDTO } from '@my-blog/shared';
import ArticleCoverFallback from '@/components/blog/ArticleCoverFallback';
import { articleApi } from '@/services/article';
import { useSiteStore } from '@/store/site';
import { pick } from '@/utils/content';
import './styles/index.module.less';

function getSocialIcon(label: string, url: string) {
  const text = `${label} ${url}`.toLowerCase();
  if (text.includes('github')) return <GithubOutlined />;
  if (text.includes('mail')) return <MailOutlined />;
  return <LinkOutlined />;
}

export default function LatestArticles() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const profile = useSiteStore((s) => s.site?.profile);
  const focusTags = [t('home.aboutFocusFrontend'), t('home.aboutFocusDesign'), t('home.aboutFocusProduct')];

  useEffect(() => {
    articleApi.articles({ pageSize: 3 }).then((res) => setArticles(res.items)).catch(() => setArticles([]));
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
      <div className="latest-layout">
        <div className="article-rows latest-card">
          {articles.map((a) => (
            <Link to={`/articles/${a.slug}`} key={a.id} className="card article-row">
              <div className="article-thumb">
                {a.cover ? (
                  <img src={a.cover} alt={pick(a.titleZh, a.titleEn)} loading="lazy" />
                ) : (
                  <ArticleCoverFallback label={a.tags[0] || 'Code'} />
                )}
              </div>
              <div className="article-row-main">
                {a.tags[0] && <span className="tag-chip">{a.tags[0]}</span>}
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
        <aside className="home-side">
          <div className="card about-card">
            <div className="about-head">
              <div className="about-avatar">
                <img src={profile?.avatar || '/images/avatar.svg'} alt={profile?.name || 'yh'} />
              </div>
              <div className="about-title">
                <span className="about-eyebrow">
                  <UserOutlined /> {t('home.aboutMe')}
                </span>
                <h3>{profile?.name || 'yh'}</h3>
                <p>{t('home.aboutRole')}</p>
              </div>
            </div>
            <p className="about-bio">{pick(profile?.bioZh, profile?.bioEn) || t('home.aboutBioFallback')}</p>
            <div className="about-focus">
              {focusTags.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="about-info">
              <span>
                <EnvironmentOutlined />
                {profile?.location || t('home.aboutLocationFallback')}
              </span>
              <span>
                <HeartOutlined />
                {t('home.aboutStatus')}
              </span>
              <span>
                <CodeOutlined />
                {t('home.aboutWorkMode')}
              </span>
            </div>
            <div className="about-socials">
              {(profile?.socials || []).slice(0, 3).map((item) => (
                <a key={`${item.label}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>
                  {getSocialIcon(item.label, item.url)}
                </a>
              ))}
            </div>
            <Link to="/about" className="article-more about-link">{t('common.learnMore')}</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
