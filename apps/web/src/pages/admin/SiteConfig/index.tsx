// 页面用途：管理首页配置、特色入口、天气城市和公告内容。
import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { HomeOutlined, ReloadOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { siteApi } from '@/services/site';
import { useBeforeUnloadWhenDirty, useDirtyConfirm } from '@/hooks/useDirtyConfirm';
import './styles/index.module.less';

const FEATURE_SLOTS = [0, 1, 2, 3, 4, 5];
type SiteConfigFormValues = Record<string, string | undefined>;

export default function SiteConfig() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState<SiteConfigFormValues | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const confirmDirty = useDirtyConfirm(dirty);
  useBeforeUnloadWhenDirty(dirty);

  useEffect(() => {
    siteApi.site().then(({ config }) => {
      const values: SiteConfigFormValues = {
        greeting: config.hero.greeting,
        titleZh: config.hero.titleZh,
        titleEn: config.hero.titleEn,
        descZh: config.hero.descZh,
        descEn: config.hero.descEn,
        weatherCity: config.weatherCity,
        announcement: config.announcement,
      };
      FEATURE_SLOTS.forEach((i) => {
        const feature = config.features[i];
        values['fIcon' + i] = feature?.icon || '';
        values['fTitleZh' + i] = feature?.titleZh || '';
        values['fTitleEn' + i] = feature?.titleEn || '';
        values['fDescZh' + i] = feature?.descZh || '';
        values['fDescEn' + i] = feature?.descEn || '';
      });
      form.setFieldsValue(values);
      setInitialValues(values);
      setDirty(false);
    });
  }, []);

  const save = async () => {
    const values = await form.validateFields();
    // 前台首页固定展示 6 个技能入口，后台按同样槽位保存，避免配置数量和 UI 不一致。
    const features = FEATURE_SLOTS.map((i) => ({
      icon: values['fIcon' + i] || '',
      titleZh: values['fTitleZh' + i] || '',
      titleEn: values['fTitleEn' + i] || '',
      descZh: values['fDescZh' + i] || '',
      descEn: values['fDescEn' + i] || '',
    }));
    setSaving(true);
    try {
      await siteApi.updateSiteConfig({
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
      setInitialValues(values);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = () => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
    setDirty(false);
  };

  return (
    <div className="admin-page admin-site-config-page">
      <div className="admin-page-head">
        <div>
          <h1>{t('admin.siteConfig')}</h1>
          <p>{t('admin.siteConfigDesc')}</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onValuesChange={() => setDirty(true)}>
        <div className="admin-config-grid">
          <div className="admin-config-main">
            <Card className="admin-panel" title={t('admin.heroConfig')}>
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

            <Card className="admin-panel" title={t('admin.featuresConfig')}>
              {FEATURE_SLOTS.map((i) => (
                <Card size="small" key={i} className="admin-feature-slot" title={`${i + 1}`}>
                  <Form.Item name={'fIcon' + i} label="Icon" style={{ marginBottom: 8 }}>
                    <Input placeholder="code / react / ts / node / idea / tool" />
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
          </div>

          <aside className="admin-config-side">
            <Card className="admin-panel" title={t('admin.basicConfig')}>
              <Form.Item name="weatherCity" label={t('admin.weatherCity')}>
                <Input placeholder="Hangzhou" />
              </Form.Item>
              <Form.Item name="announcement" label={t('admin.announcement')} style={{ marginBottom: 0 }}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Card>
            <Card className="admin-panel admin-config-note">
              <div className="admin-config-note-item">
                <span className="admin-config-note-icon"><HomeOutlined /></span>
                <div className="admin-config-note-text">
                  <strong>{t('admin.homePreview')}</strong>
                  <p>{t('admin.homePreviewDesc')}</p>
                </div>
              </div>
              <div className="admin-config-note-item">
                <span className="admin-config-note-icon"><SettingOutlined /></span>
                <div className="admin-config-note-text">
                  <strong>{t('admin.configTip')}</strong>
                  <p>{t('admin.configTipDesc')}</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </Form>
      <div className="admin-fixed-bottom-bar">
        <div className="admin-fixed-bottom-actions">
          <Button icon={<ReloadOutlined />} onClick={() => confirmDirty(resetConfig)}>{t('admin.reset')}</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} className="btn-gradient">
            {t('admin.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
