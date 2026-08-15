import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ResourceDTO } from '@my-blog/shared';
import { api } from '../../services/api';

export default function AdminResources() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ResourceDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceDTO | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.adminResources().then(setRows).finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const openModal = (row?: ResourceDTO) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) form.setFieldsValue(row);
    setOpen(true);
  };

  const save = async () => {
    const values = await form.validateFields();
    if (editing) {
      await api.updateResource(editing.id, values);
    } else {
      await api.createResource(values);
    }
    message.success(t('admin.saved'));
    setOpen(false);
    load();
  };

  const remove = async (id: number) => {
    await api.deleteResource(id);
    message.success(t('admin.deleted'));
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient" onClick={() => openModal()}>
          {t('admin.newArticle')}
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: t('admin.title'), key: 'title', render: (_, r) => r.titleZh || r.titleEn },
          { title: t('admin.category'), dataIndex: 'category', key: 'category', width: 120 },
          { title: t('admin.link'), dataIndex: 'link', key: 'link', ellipsis: true },
          {
            title: t('admin.actions'),
            key: 'actions',
            render: (_, r) => (
              <Space>
                <Button size="small" onClick={() => openModal(r)}>
                  {t('admin.edit')}
                </Button>
                <Popconfirm title={t('admin.confirmDelete')} onConfirm={() => remove(r.id)}>
                  <Button size="small" danger>
                    {t('admin.delete')}
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        open={open}
        title={editing ? t('admin.edit') : t('admin.newArticle')}
        onOk={save}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
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
          <Form.Item name="category" label={t('admin.category')}>
            <Input />
          </Form.Item>
          <Form.Item name="link" label={t('admin.link')}>
            <Input placeholder="https://" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
