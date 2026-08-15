import { useTranslation } from 'react-i18next';
import { useSiteStore } from '../store/site';

export default function Footer() {
  const { t } = useTranslation();
  const name = useSiteStore((s) => s.site?.profile.name) || 'yh';

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {new Date().getFullYear()} {name} · {t('footer.rights')}
        </span>
        <span className="footer-links">
          <a href="/admin">Admin</a>
        </span>
      </div>
    </footer>
  );
}
