import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSiteStore } from '../../store/site';
import { pick } from '../../utils/content';

export default function About() {
  const { t } = useTranslation();
  const profile = useSiteStore((s) => s.site?.profile);

  return (
    <div className="container section">
      <div className="card about-page">
        <div className="about-avatar">
          <img src={profile?.avatar || '/images/avatar.svg'} alt="avatar" />
        </div>
        <h2>
          <UserOutlined /> {profile?.name || 'yh'}
        </h2>
        <p className="meta">
          <EnvironmentOutlined /> {profile?.location}
        </p>
        <p className="about-page-bio">{pick(profile?.bioZh, profile?.bioEn)}</p>
        <div className="about-socials">
          {(profile?.socials || []).map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
        <p className="about-page-slogan">{t('footer.rights')}</p>
      </div>
    </div>
  );
}
