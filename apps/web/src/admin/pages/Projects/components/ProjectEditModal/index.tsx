// 组件用途：承载项目新增、编辑和查看，按需加载完整正文。
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Tabs,
  Upload,
  message,
} from 'antd';
import { CloseOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ProjectDTO } from '@my-blog/shared';
import { adminProjectApi } from '@/services/project';
import { uploadApi } from '@/services/upload';
import ContentEditor from '@/admin/components/ContentEditor';
import MarkdownPreviewModal from '@/admin/components/MarkdownPreviewModal';
import { useBeforeUnloadWhenDirty, useDirtyConfirm } from '@/hooks/useDirtyConfirm';
import { validateImageFile } from '@/utils/upload';
import { isHttpUrl } from '@/utils/url';
import './styles/index.less';

export type ProjectModalMode = 'create' | 'edit' | 'view';

interface ProjectEditModalProps {
  open: boolean;
  mode: ProjectModalMode;
  project: ProjectDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProjectEditModal({
  open,
  mode,
  project,
  onClose,
  onSaved,
}: ProjectEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [cover, setCover] = useState('');
  const [contentZh, setContentZh] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [preview, setPreview] = useState<string | null>(null);
  const savingRef = useRef(false);
  const isViewMode = mode === 'view';
  const disabled = isViewMode || loading || loadFailed || saving || uploading;
  const projectId = project?.id;
  const confirmDirty = useDirtyConfirm(open && dirty && !isViewMode);
  useBeforeUnloadWhenDirty(open && dirty && !isViewMode);

  useEffect(() => {
    if (!open) return;
    let active = true;
    form.resetFields();
    setCover('');
    setContentZh('');
    setContentEn('');
    setPreview(null);
    setLanguage('zh');
    setDirty(false);
    setLoadFailed(false);
    setLoading(!!projectId);
    if (projectId) {
      adminProjectApi
        .adminProject(projectId)
        .then((row) => {
          if (!active) return;
          form.setFieldsValue({
            titleZh: row.titleZh,
            titleEn: row.titleEn,
            descZh: row.descZh,
            descEn: row.descEn,
            tags: row.tags,
            link: row.link,
            featured: row.featured,
            sort: row.sort,
          });
          setCover(row.cover);
          setContentZh(row.contentZh);
          setContentEn(row.contentEn);
        })
        .catch(() => {
          if (active) setLoadFailed(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    // 关闭弹窗或切换项目后，迟到的详情响应不得覆盖下一次编辑内容。
    return () => {
      active = false;
    };
  }, [form, open, projectId, retry]);

  const close = () => {
    if (savingRef.current || uploading) return;
    confirmDirty(() => {
      setDirty(false);
      onClose();
    });
  };

  const save = async () => {
    if (disabled || savingRef.current) return;
    if (contentZh.length > 50000 || contentEn.length > 50000) {
      message.error(t('admin.projectContentTooLong'));
      return;
    }
    try {
      await form.validateFields();
    } catch {
      return;
    }
    if (savingRef.current) return;
    // 校验后加同步锁，覆盖连续点击发生在下一次渲染之前的情况。
    savingRef.current = true;
    setSaving(true);
    const body = { ...form.getFieldsValue(true), contentZh, contentEn, cover };
    body.link = body.link?.trim() || '';
    try {
      if (projectId) await adminProjectApi.updateProject(projectId, body);
      else await adminProjectApi.createProject(body);
      message.success(t('admin.saved'));
      setDirty(false);
      onSaved();
      onClose();
    } catch {
      message.error(t('admin.saveFailed'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const uploadCover = async (file: File) => {
    if (!validateImageFile(file)) return false;
    setUploading(true);
    try {
      const { url } = await uploadApi.upload(file);
      setCover(url);
      setDirty(true);
    } catch {
      message.error(t('admin.uploadFailed'));
    } finally {
      setUploading(false);
    }
    return false;
  };

  return (
    <>
      <Modal
        open={open}
        title={
          isViewMode
            ? t('admin.viewProject')
            : projectId
              ? t('admin.editProject')
              : t('admin.newProject')
        }
        width={1180}
        centered
        className="admin-project-edit-modal"
        destroyOnClose
        maskClosable={false}
        onCancel={close}
        closable={!saving && !uploading}
        keyboard={!saving && !uploading}
        footer={
          <>
            <Button icon={<CloseOutlined />} onClick={close} disabled={saving || uploading}>
              {isViewMode ? t('common.close') : t('common.cancel')}
            </Button>
            {!isViewMode && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => void save()}
                loading={saving}
                disabled={loading || loadFailed || uploading}
                className="btn-gradient"
              >
                {t('admin.save')}
              </Button>
            )}
          </>
        }
      >
        {loadFailed && (
          <Alert
            type="error"
            showIcon
            message={t('common.loadFailed')}
            action={
              <Button onClick={() => setRetry((value) => value + 1)}>{t('common.retry')}</Button>
            }
          />
        )}
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ featured: false, sort: 0, tags: [] }}
            disabled={disabled}
            onValuesChange={() => setDirty(!isViewMode)}
          >
            <div className="admin-project-editor-layout">
              <Card className="admin-panel">
                <Tabs
                  activeKey={language}
                  onChange={setLanguage}
                  items={['zh', 'en'].map((locale) => ({
                    key: locale,
                    label: t(locale === 'zh' ? 'admin.zhTab' : 'admin.enTab'),
                    children: (
                      <>
                        <Form.Item
                          name={locale === 'zh' ? 'titleZh' : 'titleEn'}
                          label={t('admin.title')}
                          rules={locale === 'zh' ? [{ required: true, whitespace: true }] : []}
                        >
                          <Input maxLength={120} />
                        </Form.Item>
                        <Form.Item
                          name={locale === 'zh' ? 'descZh' : 'descEn'}
                          label={t('admin.projectSummary')}
                        >
                          <Input.TextArea rows={3} maxLength={500} showCount />
                        </Form.Item>
                        <Form.Item label={t('admin.content')}>
                          <ContentEditor
                            value={locale === 'zh' ? contentZh : contentEn}
                            readOnly={disabled}
                            onPreview={() => setPreview(locale === 'zh' ? contentZh : contentEn)}
                            onChange={(value) => {
                              if (disabled) return;
                              if (locale === 'zh') setContentZh(value);
                              else setContentEn(value);
                              setDirty(true);
                            }}
                          />
                        </Form.Item>
                      </>
                    ),
                  }))}
                />
              </Card>
              <Card className="admin-panel" title={t('admin.basicConfig')}>
                <Form.Item label={t('admin.cover')}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {!isViewMode && (
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={uploadCover}
                        disabled={disabled}
                      >
                        <Button icon={<UploadOutlined />} loading={uploading}>
                          {t('admin.uploadCover')}
                        </Button>
                      </Upload>
                    )}
                    {cover && (
                      <img
                        src={cover}
                        alt={t('admin.coverPreview')}
                        className="admin-project-cover"
                      />
                    )}
                  </Space>
                </Form.Item>
                <Form.Item name="tags" label={t('admin.tags')} rules={[{ type: 'array', max: 12 }]}>
                  <Select mode="tags" tokenSeparators={[',', '，']} />
                </Form.Item>
                <Form.Item
                  name="link"
                  label={t('admin.projectLink')}
                  rules={[
                    {
                      validator: (_rule, value: string | undefined) =>
                        !value?.trim() || isHttpUrl(value.trim())
                          ? Promise.resolve()
                          : Promise.reject(new Error(t('admin.projectLinkInvalid'))),
                    },
                  ]}
                >
                  <Input placeholder="https://" maxLength={500} />
                </Form.Item>
                <Form.Item
                  name="featured"
                  label={t('admin.featuredProject')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item name="sort" label={t('admin.sort')}>
                  <InputNumber precision={0} />
                </Form.Item>
              </Card>
            </div>
          </Form>
        </Spin>
      </Modal>
      <MarkdownPreviewModal
        open={preview !== null}
        content={preview || ''}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
