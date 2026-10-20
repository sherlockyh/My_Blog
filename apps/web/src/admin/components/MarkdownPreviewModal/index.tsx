// 组件用途：展示Markdown 内容的弹窗预览。
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';
import './styles/index.less';

interface MarkdownPreviewModalProps {
  open: boolean;
  content: string;
  onClose: () => void;
}

export default function MarkdownPreviewModal({
  open,
  content,
  onClose,
}: MarkdownPreviewModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      title={t('admin.preview')}
      footer={null}
      width={920}
      centered
      className="admin-preview-modal"
      onCancel={onClose}
    >
      <div className="admin-markdown-preview" data-color-mode="light">
        {content ? (
          <MDEditor.Markdown source={content} />
        ) : (
          <p className="admin-preview-empty">{t('admin.contentPlaceholder')}</p>
        )}
      </div>
    </Modal>
  );
}
