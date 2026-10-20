// 页面用途：展示项目介绍，并提供明确的外部访问入口。
import { Button, Result, Space, Spin } from 'antd';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';
import { isAxiosError } from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { projectApi } from '@/services/project';
import { useRequest } from '@/hooks/useRequest';
import { pick } from '@/utils/content';
import { isHttpUrl } from '@/utils/url';
import './styles/index.less';

function ProjectNotFound() {
  const { t } = useTranslation();
  return (
    <Result
      status="404"
      title="404"
      subTitle={t('projects.notFound')}
      extra={
        <Link to="/projects">
          <Button type="primary">{t('projects.back')}</Button>
        </Link>
      }
    />
  );
}

function ProjectContent({ id }: { id: number }) {
  const { t } = useTranslation();
  const { data: project, loading, error, refresh } = useRequest(() => projectApi.project(id));

  if (loading)
    return (
      <div className="project-detail-status">
        <Spin size="large" />
      </div>
    );
  if (error) {
    if (isAxiosError(error) && error.response?.status === 404) return <ProjectNotFound />;
    return (
      <Result
        status="error"
        title={t('common.loadFailed')}
        extra={
          <Space wrap>
            <Button type="primary" onClick={() => void refresh()}>
              {t('common.retry')}
            </Button>
            <Link to="/projects">
              <Button>{t('projects.back')}</Button>
            </Link>
          </Space>
        }
      />
    );
  }
  if (!project) return <ProjectNotFound />;

  const title = pick(project.titleZh, project.titleEn);
  const description = pick(project.descZh, project.descEn);
  const content = pick(project.contentZh, project.contentEn);

  return (
    <article className="project-detail">
      <Link to="/projects" className="project-detail-back">
        <ArrowLeftOutlined /> {t('projects.back')}
      </Link>
      <header className="project-detail-header card">
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {isHttpUrl(project.link) && (
          <a
            className="project-detail-visit"
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExportOutlined /> {t('projects.visit')}
          </a>
        )}
      </header>
      {project.cover && (
        <div className="project-detail-cover card">
          <img src={project.cover} alt={title} />
        </div>
      )}
      {content && (
        <div className="project-detail-body card">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </article>
  );
}

export default function ProjectDetail() {
  const { id = '' } = useParams();
  const projectId = Number(id);
  const validId =
    /^\d+$/.test(id) && Number.isSafeInteger(projectId) && projectId > 0 && projectId <= 2147483647;
  return (
    <div className="container section project-detail-page">
      {validId ? <ProjectContent key={projectId} id={projectId} /> : <ProjectNotFound />}
    </div>
  );
}
