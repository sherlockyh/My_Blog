// 页面用途：展示后台运营概览并汇总文章、资源和留言数据。
import { CalendarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { adminArticleApi } from '@/services/article';
import { dashboardApi } from '@/services/dashboard';
import { useRequest } from '@/hooks/useRequest';
import { adminMessageApi } from '@/services/message';
import { adminResourceApi } from '@/services/resource';
import DashboardCharts, { type DistributionItem } from './components/DashboardCharts';
import DashboardCommentActivity from './components/DashboardCommentActivity';
import DashboardRecentArticles from './components/DashboardRecentArticles';
import DashboardReminderPanel from './components/DashboardReminderPanel';
import DashboardStats from './components/DashboardStats';
import './styles/index.less';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: statsData } = useRequest(() => dashboardApi.stats());
  const stats = statsData ?? null;
  const { data: articlesData } = useRequest(() =>
    adminArticleApi.adminArticles({ page: 1, pageSize: 4 }),
  );
  const articles = articlesData ?? null;
  const { data: resourcesData } = useRequest(() =>
    adminResourceApi.adminResources({ page: 1, pageSize: 4 }),
  );
  const resources = resourcesData ?? null;
  const { data: messagesData } = useRequest(() =>
    adminMessageApi.adminMessages({ page: 1, pageSize: 4 }),
  );
  const messages = messagesData ?? null;

  const totalArticles = stats?.articleCount ?? articles?.total ?? 0;
  const publishedCount = stats?.publishedCount ?? 0;
  const draftCount = Math.max(totalArticles - publishedCount, 0);
  const projectCount = stats?.projectCount ?? 0;
  const resourceCount = resources?.total ?? 0;
  const messageCount = stats?.messageCount ?? messages?.total ?? 0;
  const contentTotal = totalArticles + projectCount + resourceCount + messageCount;
  const distribution: DistributionItem[] = [
    { label: t('admin.articles'), value: totalArticles, color: '#2563eb' },
    { label: t('admin.projects'), value: projectCount, color: '#22c55e' },
    { label: t('admin.resources'), value: resourceCount, color: '#f59e0b' },
    { label: t('admin.messages'), value: messageCount, color: '#06b6d4' },
  ];

  return (
    <div className="admin-page admin-dashboard-page">
      <div className="admin-page-head">
        <div>
          <h1>{t('admin.overview')}</h1>
          <p>{t('admin.overviewDesc')}</p>
        </div>
        <div className="admin-page-date">
          <CalendarOutlined />
          {dayjs().format('YYYY-MM-DD dddd')}
        </div>
      </div>

      <DashboardStats
        totalArticles={totalArticles}
        publishedCount={publishedCount}
        draftCount={draftCount}
        projectCount={projectCount}
        resourceCount={resourceCount}
        messageCount={messageCount}
      />

      <div className="admin-dashboard-grid">
        <DashboardCharts distribution={distribution} contentTotal={contentTotal} />
        <DashboardReminderPanel
          messageCount={messageCount}
          draftCount={draftCount}
          projectCount={projectCount}
          totalViews={stats?.totalViews ?? 0}
        />
      </div>

      <div className="admin-bottom-grid">
        <DashboardRecentArticles articles={articles?.items ?? []} />
        <DashboardCommentActivity messageCount={messageCount} messages={messages?.items ?? []} />
      </div>
    </div>
  );
}
