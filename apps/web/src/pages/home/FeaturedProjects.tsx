import { useEffect, useState } from 'react';
import { ArrowRightOutlined, RocketOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ProjectDTO } from '@my-blog/shared';
import { api } from '../../services/api';
import { useSiteStore } from '../../store/site';
import { pick } from '../../utils/content';
import ProjectCard from '../../components/ProjectCard';

export default function FeaturedProjects() {
  const { t } = useTranslation();
  const profile = useSiteStore((s) => s.site?.profile);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);

  useEffect(() => {
    api.projects().then((rows) => setProjects(rows.filter((p) => p.featured).slice(0, 3))).catch(() => {});
  }, []);

  return (
    <section className="container section featured-section">
      <div className="featured-main">
        <div className="section-header">
          <h2 className="section-title">
            <RocketOutlined /> {t('home.featured')}
          </h2>
          <Link to="/projects" className="view-all">
            {t('home.viewAll')} <ArrowRightOutlined />
          </Link>
        </div>
        <div className="featured-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>

      <aside className="card about-card">
        <h3 className="section-title">
          <UserOutlined /> {t('home.aboutMe')}
        </h3>
        <div className="about-avatar">
          <img src={profile?.avatar || '/images/avatar.svg'} alt="avatar" />
        </div>
        <p className="about-bio">{pick(profile?.bioZh, profile?.bioEn)}</p>
        <p className="meta">
          <EnvironmentOutlined /> {profile?.location}
        </p>
        <div className="about-socials">
          {(profile?.socials || []).map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </aside>
    </section>
  );
}
