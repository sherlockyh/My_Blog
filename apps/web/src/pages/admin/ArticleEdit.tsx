import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Select, Space, Tabs, Upload, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';
import { ArticleStatus, type ArticleDTO } from '@my-blog/shared';
import { api } from '../../services/api';
import { useThemeStore } from '../../store/theme';

export default function ArticleEdit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const [form] = Form.useForm();
  const [contentZh, setContentZh] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [cover, setCover] = useState('');
  const [saving, setSaving] = useState(false);
  const isNew = !id || id === 'new';

  useEffect(() => {
    if (isNew) return;
    api.adminArticles().then((rows) => {
      const row = rows.find((r) => r.id === Number(id));
      if (!row) return;
      form.setFieldsValue({
        slug: row.slug,
        titleZh: row.titleZh,
        titleEn: row.titleEn,
        summaryZh: row.summaryZh,
        summaryEn: row.summaryEn,
        tags: row.tags,
        status: row.status,
      });
      setContentZh(row.contentZh || '');
      setContentEn(row.contentEn || '');
      setCover(row.cover);
    });
  }, [id]);

  const save = async () => {
    const values = await form.validateFields();
    const body: Partial<ArticleDTO> = {
      ...values,
      contentZh,
      contentEn,
      cover,
    };
    setSaving(true);
    try {
      if (isNew) {
        await api.createArticle(body);
      } else {
        await api.updateArticle(Number(id), body);
      }
      message.success(t('admin.saved'));
      navigate('/admin/articles');
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file: File) => {
    const { url } = await api.upload(file);
    setCover(url);
    return false;
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link to="/admin/articles">
          <Button icon={<ArrowLeftOutlined />}>{t('articles.back')}</Button>
        </Link>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} className="btn-gradient">
          {t('admin.save')}
        </Button>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" initialValues={{ status: ArticleStatus.DRAFT, tags: [] }}>
          <Form.Item name="slug" label={t('admin.slug')} rules={[{ required: true }]}>
            <Input placeholder="my-first-post" />
          </Form.Item>
          <Tabs
            items={[
              {
                key: 'zh',
                label: t('admin.zhTab'),
                children: (
                  <>
                    <Form.Item name="titleZh" label={t('admin.articleTitle')} rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="summaryZh" label={t('admin.summary')}>
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'en',
                label: t('admin.enTab'),
                children: (
                  <>
                    <Form.Item name="titleEn" label={t('admin.articleTitle')}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="summaryEn" label={t('admin.summary')}>
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
          <Form.Item label={t('admin.cover')}>
            <Space>
              <Upload accept="image/*" showUploadList={false} beforeUpload={uploadCover}>
                <Button icon={<UploadOutlined />}>{t('admin.cover')}</Button>
              </Upload>
              {cover && <img src={cover} alt="cover" style={{ height: 48, borderRadius: 8 }} />}
            </Space>
          </Form.Item>
          <Form.Item name="tags" label={t('admin.tags')}>
            <Select mode="tags" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="status" label={t('admin.status')}>
            <Select
              options={[
                { value: ArticleStatus.PUBLISHED, label: t('admin.published') },
                { value: ArticleStatus.DRAFT, label: t('admin.draft') },
              ]}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title={t('admin.content')} style={{ marginBottom: 16 }}>
        <Tabs
          items={[
            {
              key: 'zh',
              label: t('admin.zhTab'),
              children: (
                <div data-color-mode={theme}>
                  <MDEditor value={contentZh} onChange={(v) => setContentZh(v || '')} height={480} />
                </div>
              ),
            },
            {
              key: 'en',
              label: t('admin.enTab'),
              children: (
                <div data-color-mode={theme}>
                  <MDEditor value={contentEn} onChange={(v) => setContentEn(v || '')} height={480} />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
