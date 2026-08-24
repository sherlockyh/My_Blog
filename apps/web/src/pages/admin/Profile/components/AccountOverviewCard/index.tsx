// 组件用途：展示后台个人资料的账户概览。
import { Avatar, Card } from 'antd';
import type { FormInstance } from 'antd';
import { MailOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ProfileFormValues } from '../ProfileFormCard';

interface AccountOverviewCardProps {
  form: FormInstance<ProfileFormValues>;
  avatar: string;
}

export default function AccountOverviewCard({ form, avatar }: AccountOverviewCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="admin-panel admin-account-card">
      <div className="admin-panel-title">
        <span><SafetyCertificateOutlined /></span>
        <h2>{t('admin.accountOverview')}</h2>
      </div>
      <div className="admin-account-avatar">
        <Avatar src={avatar} size={132} icon={<UserOutlined />} />
        <strong>{form.getFieldValue('name') || 'Admin'}</strong>
        <span>{t('admin.adminRole')}</span>
      </div>
      <div className="admin-account-list">
        <div>
          <span><MailOutlined /></span>
          <p>{t('admin.email')}</p>
          <strong>admin@myblog.local</strong>
        </div>
        <div>
          <span><UserOutlined /></span>
          <p>{t('admin.accountRole')}</p>
          <strong>{t('admin.adminRole')}</strong>
        </div>
        <div>
          <span><SafetyCertificateOutlined /></span>
          <p>{t('admin.accountStatus')}</p>
          <strong className="admin-account-normal">{t('admin.normal')}</strong>
        </div>
      </div>
    </Card>
  );
}
