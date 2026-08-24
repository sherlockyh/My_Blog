// 组件用途：编辑个人基础资料、头像和社交链接。
import { Avatar, Button, Card, Form, Input, Space, Upload } from 'antd';
import {
  EnvironmentOutlined,
  LinkOutlined,
  MailOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export interface ProfileFormValues {
  name?: string;
  bioZh?: string;
  bioEn?: string;
  location?: string;
  socials?: { label: string; url: string }[];
}

interface ProfileFormCardProps {
  avatar: string;
  onUploadAvatar: (file: File) => boolean | Promise<boolean>;
  onDirty: () => void;
}

export default function ProfileFormCard({ avatar, onUploadAvatar, onDirty }: ProfileFormCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="admin-panel admin-profile-form">
      <div className="admin-panel-title">
        <span><UserOutlined /></span>
        <h2>{t('admin.basicInfo')}</h2>
      </div>
      <div className="admin-form-row admin-avatar-row">
        <span className="admin-form-icon"><UserOutlined /></span>
        <Form.Item label={t('admin.avatar')}>
          <Space>
            <Avatar src={avatar} size={64} />
            <Upload accept="image/*" showUploadList={false} beforeUpload={onUploadAvatar}>
              <Button icon={<UploadOutlined />}>{t('admin.avatar')}</Button>
            </Upload>
          </Space>
        </Form.Item>
      </div>
      <div className="admin-form-row">
        <span className="admin-form-icon"><UserOutlined /></span>
        <Form.Item name="name" label={t('admin.name')}>
          <Input size="large" />
        </Form.Item>
      </div>
      <div className="admin-form-row">
        <span className="admin-form-icon"><EnvironmentOutlined /></span>
        <Form.Item name="location" label={t('admin.location')}>
          <Input size="large" />
        </Form.Item>
      </div>
      <div className="admin-form-row">
        <span className="admin-form-icon"><MailOutlined /></span>
        <Form.Item name="bioZh" label={t('admin.bioZh')}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </div>
      <div className="admin-form-row">
        <span className="admin-form-icon"><MailOutlined /></span>
        <Form.Item name="bioEn" label={t('admin.bioEn')}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </div>

      <div className="admin-divider" />

      <div className="admin-panel-title">
        <span><LinkOutlined /></span>
        <h2>{t('admin.socials')}</h2>
      </div>
      <Form.List name="socials">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...rest }) => (
              <Space key={key} align="baseline" className="admin-social-row">
                <Form.Item {...rest} name={[name, 'label']} rules={[{ required: true }]}>
                  <Input placeholder="GitHub" />
                </Form.Item>
                <Form.Item {...rest} name={[name, 'url']} rules={[{ required: true }]}>
                  <Input placeholder="https://github.com/..." />
                </Form.Item>
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  aria-label={t('admin.delete')}
                  onClick={() => {
                    remove(name);
                    onDirty();
                  }}
                />
              </Space>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => {
                add();
                onDirty();
              }}
            >
              {t('admin.socials')}
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  );
}
