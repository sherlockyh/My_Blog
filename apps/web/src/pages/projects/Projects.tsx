import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectDTO } from '@my-blog/shared';
import { api } from '../../services/api';
import ProjectCard from '../../components/ProjectCard';

export default function Projects() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);

  useEffect(() => {
    api.projects().then(setProjects).catch(() => {});
  }, []);

  return (
    <div className="container section">
      <div className="section-header">
        <h2 className="section-title">{t('nav.projects')}</h2>
      </div>
      <div className="projects-grid">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
