// 组件用途：展示后台留言动态概览。
import { Button, Card } from 'antd';
import { MessageOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface DashboardCommentActivityProps {
  messageCount: number;
}

export default function DashboardCommentActivity({ messageCount }: DashboardCommentActivityProps) {
  const { t } = useTranslation();

  return (
    <Card className="admin-panel">
      <div className="admin-panel-title admin-panel-title-between">
        <span><MessageOutlined /></span>
        <h2>{t('admin.commentActivity')}</h2>
        <Link to="/admin/messages">{t('home.viewAll')} <RightOutlined /></Link>
      </div>
      <div className="admin-message-empty">
        <MessageOutlined />
        <strong>{messageCount ? t('admin.messageCount') : t('admin.noMessages')}</strong>
        <p>{messageCount ? t('admin.messageManage') : t('admin.noMessagesDesc')}</p>
        {messageCount > 0 && <Button size="small" href="/admin/messages">{t('common.view')}</Button>}
      </div>
    </Card>
  );
}
