// 组件用途：承载项目新增、编辑和查看弹窗。
import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, Space, Switch, Upload, message } from 'antd';
import { CloseOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ProjectDTO } from '@my-blog/shared';
import { adminProjectApi } from '@/services/project';
import { uploadApi } from '@/services/upload';
import { useBeforeUnloadWhenDirty, useDirtyConfirm } from '@/hooks/useDirtyConfirm';
import { validateImageFile } from '@/utils/upload';

export type ProjectModalMode = 'create' | 'edit' | 'view';

interface ProjectEditModalProps {
  open: boolean;
  mode: ProjectModalMode;
  project: ProjectDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProjectEditModal({ open, mode, project, onClose, onSaved }: ProjectEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [cover, setCover] = useState('');
  const [dirty, setDirty] = useState(false);
  const isViewMode = mode === 'view';
  const confirmDirty = useDirtyConfirm(open && dirty && !isViewMode);
  useBeforeUnloadWhenDirty(open && dirty && !isViewMode);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (project) {
      form.setFieldsValue(project);
      setCover(project.cover);
    } else {
      setCover('');
    }
    setDirty(false);
  }, [form, open, project]);

  const close = () => {
    confirmDirty(() => {
      setDirty(false);
      onClose();
    });
  };

  const save = async () => {
    if (isViewMode) return;
    const values = await form.validateFields();
    const body = { ...values, cover };
    if (project) {
      await adminProjectApi.updateProject(project.id, body);
    } else {
      await adminProjectApi.createProject(body);
    }
    message.success(t('admin.saved'));
    setDirty(false);
    onSaved();
    onClose();
  };

  const uploadCover = async (file: File) => {
    if (!validateImageFile(file)) return false;
    const { url } = await uploadApi.upload(file);
    setCover(url);
    setDirty(true);
    return false;
  };

  return (
    <Modal
      open={open}
      title={isViewMode ? t('admin.viewProject') : project ? t('admin.editProject') : t('admin.newProject')}
      onOk={save}
      onCancel={close}
      footer={isViewMode ? (
        <Button icon={<CloseOutlined />} onClick={close}>
          {t('common.close')}
        </Button>
      ) : (
        <>
          <Button icon={<CloseOutlined />} onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={save} className="btn-gradient">
            {t('admin.save')}
          </Button>
        </>
      )}
      className="admin-edit-modal"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ featured: false, sort: 0, tags: [] }} onValuesChange={() => setDirty(!isViewMode)}>
        <Form.Item name="titleZh" label={t('admin.titleZh')} rules={[{ required: true }]}>
          <Input disabled={isViewMode} />
        </Form.Item>
        <Form.Item name="titleEn" label={t('admin.titleEn')}>
          <Input disabled={isViewMode} />
        </Form.Item>
        <Form.Item name="descZh" label={t('admin.descZh')}>
          <Input.TextArea rows={2} disabled={isViewMode} />
        </Form.Item>
        <Form.Item name="descEn" label={t('admin.descEn')}>
          <Input.TextArea rows={2} disabled={isViewMode} />
        </Form.Item>
        <Form.Item label={t('admin.cover')}>
          <Space>
            {!isViewMode && (
              <Upload accept="image/*" showUploadList={false} beforeUpload={uploadCover}>
                <Button icon={<UploadOutlined />}>{t('admin.cover')}</Button>
              </Upload>
            )}
            {cover && <img src={cover} alt="cover" style={{ height: 40, borderRadius: 8 }} />}
          </Space>
        </Form.Item>
        <Form.Item name="tags" label={t('admin.tags')}>
          <Select mode="tags" tokenSeparators={[',']} disabled={isViewMode} />
        </Form.Item>
        <Form.Item name="link" label={t('admin.link')}>
          <Input placeholder="https://" disabled={isViewMode} />
        </Form.Item>
        <Form.Item name="featured" label={t('admin.featuredProject')} valuePropName="checked">
          <Switch disabled={isViewMode} />
        </Form.Item>
        <Form.Item name="sort" label={t('admin.sort')}>
          <InputNumber disabled={isViewMode} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
