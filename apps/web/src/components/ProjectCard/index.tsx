// 组件用途：展示项目卡片及项目卡片链接包装。
import { Link } from 'react-router-dom';
import type { ProjectDTO } from '@my-blog/shared';
import { pick } from '@/utils/content';
import './styles/index.module.less';

export default function ProjectCard({ project }: { project: ProjectDTO }) {
  return (
    <a className="card project-card" href={project.link || undefined} target={project.link ? '_blank' : undefined} rel="noreferrer">
      <div className="project-cover">
        {project.cover ? <img src={project.cover} alt={pick(project.titleZh, project.titleEn)} /> : <div className="project-cover-fallback" />}
        {project.tags[0] && <span className="project-badge">{project.tags[0]}</span>}
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
