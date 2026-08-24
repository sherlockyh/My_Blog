// 组件用途：展示后台运营提醒事项。
import { Card } from 'antd';
import { BellOutlined, ClockCircleOutlined, FileTextOutlined, ReadOutlined, RightOutlined, StarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface DashboardReminderPanelProps {
  messageCount: number;
  draftCount: number;
  projectCount: number;
  totalViews: number;
}

export default function DashboardReminderPanel({ messageCount, draftCount, projectCount, totalViews }: DashboardReminderPanelProps) {
  const { t } = useTranslation();
  const reminders = [
    { icon: <ClockCircleOutlined />, title: t('admin.pendingMessages', { count: messageCount }), desc: t('admin.messageManage') },
    { icon: <FileTextOutlined />, title: t('admin.draftArticles', { count: draftCount }), desc: t('admin.contentManage') },
    { icon: <StarOutlined />, title: t('admin.featuredProjects', { count: projectCount }), desc: t('admin.projectManage') },
    { icon: <ReadOutlined />, title: t('admin.totalViews'), desc: String(totalViews) },
  ];

  return (
    <Card className="admin-panel admin-reminder-panel">
      <div className="admin-panel-title">
        <span><BellOutlined /></span>
        <h2>{t('admin.operationReminder')}</h2>
      </div>
      {reminders.map((item) => (
        <div className="admin-reminder-item" key={item.title}>
          <span>{item.icon}</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </div>
          <RightOutlined />
        </div>
      ))}
    </Card>
  );
}
