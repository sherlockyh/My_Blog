// 组件用途：承载资源新增、编辑和查看弹窗。
import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, message } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ResourceDTO } from '@my-blog/shared';
import { adminResourceApi } from '@/services/resource';
import { useBeforeUnloadWhenDirty, useDirtyConfirm } from '@/hooks/useDirtyConfirm';

export type ResourceModalMode = 'create' | 'edit' | 'view';

interface ResourceEditModalProps {
  open: boolean;
  mode: ResourceModalMode;
  resource: ResourceDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ResourceEditModal({ open, mode, resource, onClose, onSaved }: ResourceEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [dirty, setDirty] = useState(false);
  const isViewMode = mode === 'view';
  const confirmDirty = useDirtyConfirm(open && dirty && !isViewMode);
  useBeforeUnloadWhenDirty(open && dirty && !isViewMode);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (resource) form.setFieldsValue(resource);
    setDirty(false);
  }, [form, open, resource]);

  const close = () => {
    confirmDirty(() => {
      setDirty(false);
      onClose();
    });
  };

  const save = async () => {
    if (isViewMode) return;
    const values = await form.validateFields();
    if (resource) {
      await adminResourceApi.updateResource(resource.id, values);
    } else {
      await adminResourceApi.createResource(values);
    }
    message.success(t('admin.saved'));
    setDirty(false);
    onSaved();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={isViewMode ? t('admin.viewResource') : resource ? t('admin.editResource') : t('admin.newResource')}
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
      <Form form={form} layout="vertical" onValuesChange={() => setDirty(!isViewMode)}>
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
        <Form.Item name="category" label={t('admin.category')}>
          <Input disabled={isViewMode} />
        </Form.Item>
        <Form.Item name="link" label={t('admin.link')}>
          <Input placeholder="https://" disabled={isViewMode} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
