// 组件用途：展示后台留言动态概览。
import { Card } from 'antd';
import { MessageOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { MessageDTO } from '@my-blog/shared';

interface DashboardCommentActivityProps {
  messageCount: number;
  messages: MessageDTO[];
}

export default function DashboardCommentActivity({ messageCount, messages }: DashboardCommentActivityProps) {
  const { t } = useTranslation();
  const latestMessages = messages.slice(0, 4);

  return (
    <Card className="admin-panel">
      <div className="admin-panel-title admin-panel-title-between">
        <span><MessageOutlined /></span>
        <h2>{t('admin.commentActivity')}</h2>
        <Link to="/admin/messages">{t('home.viewAll')} <RightOutlined /></Link>
      </div>
      {latestMessages.length ? (
        <div className="admin-recent-list">
          {latestMessages.map((message) => (
            <div className="admin-recent-item" key={message.id}>
              <div className="admin-article-cover"><MessageOutlined /></div>
              <div>
                <strong>{message.nickname}</strong>
                <p>
                  {message.content.length > 48 ? `${message.content.slice(0, 48)}...` : message.content}
                  {' · '}
                  {dayjs(message.createdAt).format('YYYY/MM/DD HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-message-empty">
          <MessageOutlined />
          <strong>{messageCount ? t('admin.messageCount') : t('admin.noMessages')}</strong>
          <p>{messageCount ? t('admin.messageManage') : t('admin.noMessagesDesc')}</p>
        </div>
      )}
    </Card>
  );
}
