// 组件用途：展示公开站点底部导航和版权信息。
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GithubOutlined, GlobalOutlined } from '@ant-design/icons';
import { useSiteStore } from '@/store/site';
import './styles/index.module.less';

export default function Footer() {
  const { t } = useTranslation();
  const profile = useSiteStore((s) => s.site?.profile);
  const name = profile?.name || 'yh';
  const socials = profile?.socials || [];

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-motto">Stay hungry. Stay foolish.</div>
        <nav className="footer-nav" aria-label="footer navigation">
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/articles">{t('nav.articles')}</Link>
          <Link to="/projects">{t('nav.projects')}</Link>
          <Link to="/resources">{t('nav.resources')}</Link>
          <Link to="/guestbook">{t('nav.guestbook')}</Link>
        </nav>
        <div className="footer-copy">
          © {new Date().getFullYear()} {name} · {t('footer.rights')}
        </div>
        <span className="footer-links">
          {socials.map((item) => (
            <a key={item.label} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>
              {item.label.toLowerCase().includes('github') ? <GithubOutlined /> : <GlobalOutlined />}
            </a>
          ))}
          <a href="/admin">{t('footer.admin')}</a>
        </span>
      </div>
    </footer>
  );
}
