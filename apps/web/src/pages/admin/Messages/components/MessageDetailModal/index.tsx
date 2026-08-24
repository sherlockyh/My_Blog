// 组件用途：展示后台留言详情弹窗。
import { Button, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { MessageDTO } from '@my-blog/shared';
import './styles/index.module.less';

interface MessageDetailModalProps {
  message: MessageDTO | null;
  onClose: () => void;
}

export default function MessageDetailModal({ message, onClose }: MessageDetailModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={Boolean(message)}
      title={t('admin.messageDetail')}
      onCancel={onClose}
      footer={
        <Button icon={<CloseOutlined />} onClick={onClose}>
          {t('common.close')}
        </Button>
      }
      className="admin-edit-modal"
    >
      {message && (
        <div className="admin-message-detail">
          <div>
            <span>{t('admin.nickname')}</span>
            <strong>{message.nickname}</strong>
          </div>
          <div>
            <span>{t('admin.updatedAt')}</span>
            <strong>{dayjs(message.createdAt).format('YYYY-MM-DD HH:mm')}</strong>
          </div>
          <p>{message.content}</p>
        </div>
      )}
    </Modal>
  );
}
