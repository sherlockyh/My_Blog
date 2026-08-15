import { Link } from 'react-router-dom';
import type { ProjectDTO } from '@my-blog/shared';
import { pick } from '../utils/content';

export default function ProjectCard({ project }: { project: ProjectDTO }) {
  return (
    <a className="card project-card" href={project.link || undefined} target={project.link ? '_blank' : undefined} rel="noreferrer">
      <div className="project-cover">
        {project.cover ? <img src={project.cover} alt={pick(project.titleZh, project.titleEn)} /> : <div className="project-cover-fallback" />}
        <span className="project-cover-title">{pick(project.titleZh, project.titleEn)}</span>
      </div>
      <div className="project-body">
        <h3>{pick(project.titleZh, project.titleEn)}</h3>
        <p>{pick(project.descZh, project.descEn)}</p>
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

export function ProjectCardLink({ project }: { project: ProjectDTO }) {
  return <Link to="/projects"><ProjectCard project={project} /></Link>;
}
