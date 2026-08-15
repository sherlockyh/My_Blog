import { useEffect, useState } from 'react';
import { Avatar, Button, Card, Form, Input, Space, Upload, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

export default function AdminProfile() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.site().then(({ profile }) => {
      form.setFieldsValue({
        name: profile.name,
        bioZh: profile.bioZh,
        bioEn: profile.bioEn,
        location: profile.location,
        socials: profile.socials,
      });
      setAvatar(profile.avatar);
    });
  }, []);

  const uploadAvatar = async (file: File) => {
    const { url } = await api.upload(file);
    setAvatar(url);
    return false;
  };

  const save = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await api.updateProfile({ ...values, avatar });
      message.success(t('admin.saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Card style={{ marginBottom: 16 }}>
        <Form.Item label={t('admin.avatar')}>
          <Space>
            <Avatar src={avatar} size={64} />
            <Upload accept="image/*" showUploadList={false} beforeUpload={uploadAvatar}>
              <Button icon={<UploadOutlined />}>{t('admin.avatar')}</Button>
            </Upload>
          </Space>
        </Form.Item>
        <Form.Item name="name" label={t('admin.name')}>
          <Input />
        </Form.Item>
        <Form.Item name="bioZh" label={t('admin.bioZh')}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="bioEn" label={t('admin.bioEn')}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="location" label={t('admin.location')} style={{ marginBottom: 0 }}>
          <Input />
        </Form.Item>
      </Card>

      <Card title={t('admin.socials')} style={{ marginBottom: 16 }}>
        <Form.List name="socials">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item {...rest} name={[name, 'label']} rules={[{ required: true }]}>
                    <Input placeholder="GitHub" />
                  </Form.Item>
                  <Form.Item {...rest} name={[name, 'url']} rules={[{ required: true }]}>
                    <Input placeholder="https://github.com/..." style={{ width: 320 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>
                {t('admin.socials')}
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} className="btn-gradient">
        {t('admin.save')}
      </Button>
    </Form>
  );
}
