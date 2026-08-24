// 组件用途：展示后台核心统计卡片。
import { Card } from 'antd';
import { FileTextOutlined, MessageOutlined, ProjectOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface DashboardStatsProps {
  totalArticles: number;
  publishedCount: number;
  draftCount: number;
  projectCount: number;
  resourceCount: number;
  messageCount: number;
}

export default function DashboardStats({
  totalArticles,
  publishedCount,
  draftCount,
  projectCount,
  resourceCount,
  messageCount,
}: DashboardStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="admin-stat-grid">
      <Card className="admin-stat-card admin-stat-blue">
        <span className="admin-stat-icon"><FileTextOutlined /></span>
        <div>
          <p>{t('admin.articleCount')}</p>
          <strong>{totalArticles}</strong>
          <span>{t('admin.publishedWithDraft', { published: publishedCount, draft: draftCount })}</span>
        </div>
      </Card>
      <Card className="admin-stat-card admin-stat-green">
        <span className="admin-stat-icon"><ProjectOutlined /></span>
        <div>
          <p>{t('admin.projectCount')}</p>
          <strong>{projectCount}</strong>
          <span>{t('admin.featuredProject')}</span>
        </div>
      </Card>
      <Card className="admin-stat-card admin-stat-purple">
        <span className="admin-stat-icon"><ShareAltOutlined /></span>
        <div>
          <p>{t('admin.resourceCount')}</p>
          <strong>{resourceCount}</strong>
          <span>{t('admin.resourceMaintain')}</span>
        </div>
      </Card>
      <Card className="admin-stat-card admin-stat-orange">
        <span className="admin-stat-icon"><MessageOutlined /></span>
        <div>
          <p>{t('admin.messageCount')}</p>
          <strong>{messageCount}</strong>
          <span>{t('admin.totalMessages')}</span>
        </div>
      </Card>
    </div>
  );
}
