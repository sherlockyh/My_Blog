// 页面用途：展示个人介绍、技术关注点和行动入口。
import {
  BulbOutlined,
  CodeOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  LinkOutlined,
  MailOutlined,
  MessageOutlined,
  ProjectOutlined,
  ReadOutlined,
  RocketOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteStore } from '@/store/site';
import { pick } from '@/utils/content';
import './styles/index.module.less';

function getSocialIcon(label: string, url: string) {
  const text = `${label} ${url}`.toLowerCase();
  if (text.includes('github')) return <GithubOutlined />;
  if (text.includes('mail')) return <MailOutlined />;
  return <LinkOutlined />;
}

export default function About() {
  const { t } = useTranslation();
  const profile = useSiteStore((s) => s.site?.profile);
  const profileName = profile?.name || 'yh';
  const bio = pick(profile?.bioZh, profile?.bioEn) || t('aboutPage.bioFallback');
  const focusItems = [
    { icon: <CodeOutlined />, title: t('aboutPage.focusFrontend'), desc: t('aboutPage.focusFrontendDesc') },
    { icon: <BulbOutlined />, title: t('aboutPage.focusExperience'), desc: t('aboutPage.focusExperienceDesc') },
    { icon: <ReadOutlined />, title: t('aboutPage.focusWriting'), desc: t('aboutPage.focusWritingDesc') },
  ];
  const stats = [
    { value: 'React', label: t('aboutPage.stack') },
    { value: 'TypeScript', label: t('aboutPage.language') },
    { value: 'Design', label: t('aboutPage.keyword') },
  ];

  return (
    <div className="about-page-wrap">
      <section className="container section">
        <div className="about-page-hero">
          <div className="card about-profile-panel">
            <div className="about-page-avatar">
              <img src={profile?.avatar || '/images/avatar.svg'} alt={profileName} />
            </div>
            <div className="about-profile-name">
              <span>
                <UserOutlined /> {t('aboutPage.badge')}
              </span>
              <h1>{profileName}</h1>
              <p>{t('aboutPage.role')}</p>
            </div>
            <div className="about-profile-meta">
              <span>
                <EnvironmentOutlined /> {profile?.location || t('home.aboutLocationFallback')}
              </span>
              <span>
                <RocketOutlined /> {t('aboutPage.status')}
              </span>
            </div>
            <div className="about-page-socials">
              {(profile?.socials || []).slice(0, 4).map((item) => (
                <a key={`${item.label}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>
                  {getSocialIcon(item.label, item.url)}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="card about-story-panel">
            <div className="about-section-kicker">{t('aboutPage.kicker')}</div>
            <h2>{t('aboutPage.title')}</h2>
            <p>{bio}</p>
            <p>{t('aboutPage.story')}</p>
            <div className="about-page-stats">
              {stats.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="about-page-grid">
          {focusItems.map((item) => (
            <div className="card about-focus-card" key={item.title}>
              <div className="about-focus-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="card about-page-bottom">
          <div>
            <div className="about-section-kicker">{t('aboutPage.nowKicker')}</div>
            <h2>{t('aboutPage.nowTitle')}</h2>
            <p>{t('aboutPage.nowDesc')}</p>
          </div>
          <div className="about-page-actions">
            <Link to="/articles">
              <ReadOutlined /> {t('aboutPage.readArticles')}
            </Link>
            <Link to="/projects">
              <ProjectOutlined /> {t('aboutPage.viewProjects')}
            </Link>
            <Link to="/guestbook">
              <MessageOutlined /> {t('aboutPage.leaveMessage')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
