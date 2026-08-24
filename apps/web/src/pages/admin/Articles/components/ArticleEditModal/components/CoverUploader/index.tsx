// 组件用途：处理文章封面预览、上传和地址输入。
import { Button, Card, Input, Space, Upload } from 'antd';
import { FileImageOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface CoverUploaderProps {
  cover: string;
  isViewMode: boolean;
  onCoverChange: (value: string) => void;
  onUploadCover: (file: File) => boolean | Promise<boolean>;
}

export default function CoverUploader({ cover, isViewMode, onCoverChange, onUploadCover }: CoverUploaderProps) {
  const { t } = useTranslation();

  return (
    <Card className="admin-panel admin-cover-card" title={t('admin.coverPreview')}>
      <div className="admin-cover-preview">
        {cover ? (
          <img src={cover} alt="cover" />
        ) : (
          <div>
            <FileImageOutlined />
            <span>{t('admin.noCover')}</span>
          </div>
        )}
      </div>
      <Space direction="vertical" size={12} className="admin-cover-actions">
        {!isViewMode && (
          <Upload accept="image/*" showUploadList={false} beforeUpload={onUploadCover}>
            <Button block icon={<UploadOutlined />}>{t('admin.uploadCover')}</Button>
          </Upload>
        )}
        <Input
          value={cover}
          placeholder={t('admin.coverUrl')}
          disabled={isViewMode}
          onChange={(event) => onCoverChange(event.target.value)}
        />
      </Space>
    </Card>
  );
}
