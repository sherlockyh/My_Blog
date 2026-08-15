import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

export default function SiteConfig() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.site().then(({ config }) => {
      form.setFieldsValue({
        greeting: config.hero.greeting,
        titleZh: config.hero.titleZh,
        titleEn: config.hero.titleEn,
        descZh: config.hero.descZh,
        descEn: config.hero.descEn,
        weatherCity: config.weatherCity,
        announcement: config.announcement,
      });
      config.features.forEach((f, i) => {
        form.setFields([
          { name: ['fIcon' + i], value: f.icon },
          { name: ['fTitleZh' + i], value: f.titleZh },
          { name: ['fTitleEn' + i], value: f.titleEn },
          { name: ['fDescZh' + i], value: f.descZh },
          { name: ['fDescEn' + i], value: f.descEn },
        ]);
      });
    });
  }, []);

  const save = async () => {
    const values = await form.validateFields();
    const features = [0, 1, 2, 3].map((i) => ({
      icon: values['fIcon' + i] || '',
      titleZh: values['fTitleZh' + i] || '',
      titleEn: values['fTitleEn' + i] || '',
      descZh: values['fDescZh' + i] || '',
      descEn: values['fDescEn' + i] || '',
    }));
    setSaving(true);
    try {
      await api.updateSiteConfig({
        hero: {
          greeting: values.greeting,
          titleZh: values.titleZh,
          titleEn: values.titleEn,
          descZh: values.descZh,
          descEn: values.descEn,
        },
        features,
        weatherCity: values.weatherCity,
        announcement: values.announcement,
      });
      message.success(t('admin.saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Card title={t('admin.heroConfig')} style={{ marginBottom: 16 }}>
        <Form.Item name="greeting" label={t('admin.greeting')}>
          <Input />
        </Form.Item>
        <Form.Item name="titleZh" label={t('admin.titleZh')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="titleEn" label={t('admin.titleEn')}>
          <Input />
        </Form.Item>
        <Form.Item name="descZh" label={t('admin.descZh')}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="descEn" label={t('admin.descEn')}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Card>

      <Card title={t('admin.featuresConfig')} style={{ marginBottom: 16 }}>
        {[0, 1, 2, 3].map((i) => (
          <Card size="small" key={i} style={{ marginBottom: 12 }} title={`${i + 1}`}>
            <Form.Item name={'fIcon' + i} label="Icon" style={{ marginBottom: 8 }}>
              <Input placeholder="thunder / box / layers / team" />
            </Form.Item>
            <Form.Item name={'fTitleZh' + i} label={t('admin.titleZh')} style={{ marginBottom: 8 }}>
              <Input />
            </Form.Item>
            <Form.Item name={'fTitleEn' + i} label={t('admin.titleEn')} style={{ marginBottom: 8 }}>
              <Input />
            </Form.Item>
            <Form.Item name={'fDescZh' + i} label={t('admin.descZh')} style={{ marginBottom: 8 }}>
              <Input />
            </Form.Item>
            <Form.Item name={'fDescEn' + i} label={t('admin.descEn')} style={{ marginBottom: 0 }}>
              <Input />
            </Form.Item>
          </Card>
        ))}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Form.Item name="weatherCity" label={t('admin.weatherCity')}>
          <Input placeholder="Hangzhou" />
        </Form.Item>
        <Form.Item name="announcement" label={t('admin.announcement')} style={{ marginBottom: 0 }}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Card>

      <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} className="btn-gradient">
        {t('admin.save')}
      </Button>
    </Form>
  );
}
