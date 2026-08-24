// 组件用途：展示后台数据加载失败后的重试提示。
import { Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './styles/index.module.less';

interface AdminLoadErrorProps {
  onRetry: () => void;
}

export default function AdminLoadError({ onRetry }: AdminLoadErrorProps) {
  const { t } = useTranslation();

  return (
    <Alert
      type="error"
      showIcon
      className="admin-load-error"
      message={t('common.loadFailed')}
      action={
        <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
          {t('common.retry')}
        </Button>
      }
    />
  );
}
