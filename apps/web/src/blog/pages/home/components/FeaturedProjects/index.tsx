// 组件用途：展示首页精选项目区块。
import { ArrowRightOutlined, RocketOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectApi } from '@/services/project';
import { useRequest } from '@/hooks/useRequest';
import ProjectCard from '@/blog/components/ProjectCard';
import './styles/index.less';

export default function FeaturedProjects() {
  const { t } = useTranslation();
  const { data } = useRequest(() => projectApi.projects());
  const projects = data ?? [];

  const featured = [...projects]
    .sort((a, b) => a.sort - b.sort)
    .filter((project) => project.featured)
    .slice(0, 3);
  const rows = featured.length
    ? featured
    : [...projects].sort((a, b) => a.sort - b.sort).slice(0, 3);

  if (!rows.length) return null;

  return (
    <section className="container section featured-section">
      <div className="section-header">
        <h2 className="section-title">
          <RocketOutlined /> {t('home.featuredProjects')}
        </h2>
        <Link to="/projects" className="view-all">
          {t('home.viewAllProjects')} <ArrowRightOutlined />
        </Link>
      </div>
      <div className="featured-grid">
        {rows.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
