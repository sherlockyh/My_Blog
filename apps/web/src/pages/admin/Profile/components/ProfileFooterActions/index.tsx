// 组件用途：展示个人资料页底部重置和保存操作。
import { Button } from 'antd';
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ProfileFooterActionsProps {
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
}

export default function ProfileFooterActions({ saving, onReset, onSave }: ProfileFooterActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="admin-fixed-bottom-bar">
      <div className="admin-fixed-bottom-actions">
        <Button icon={<ReloadOutlined />} onClick={onReset}>{t('admin.reset')}</Button>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave} className="btn-gradient">
          {t('admin.save')}
        </Button>
      </div>
    </div>
  );
}
