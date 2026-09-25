// 页面用途：展示留言板并提交访客留言。
import { Button, Card, Form, Input, List, message } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { messageApi } from '@/services/message';
import { useRequest } from '@/hooks/useRequest';
import './styles/index.less';

export default function Guestbook() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { data, refresh } = useRequest(() => messageApi.messages());
  const messages = data ?? [];

  const submit = async () => {
    const values = await form.validateFields();
    await messageApi.postMessage(values);
    message.success(t('guestbook.submitOk'));
    form.resetFields();
    void refresh();
  };

  return (
    <div className="container section guestbook">
      <div className="section-header">
        <h2 className="section-title">
          <MessageOutlined /> {t('guestbook.title')}
        </h2>
      </div>
      <p className="guestbook-subtitle">{t('guestbook.subtitle')}</p>

      <Card className="guestbook-form">
        <Form form={form} layout="vertical">
          <Form.Item
            name="nickname"
            label={t('guestbook.nickname')}
            rules={[{ required: true, max: 20 }]}
          >
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item
            name="content"
            label={t('guestbook.content')}
            rules={[{ required: true, max: 500 }]}
          >
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
          <Button type="primary" className="btn-gradient" onClick={submit}>
            {t('guestbook.submit')}
          </Button>
        </Form>
      </Card>

      <List
        className="guestbook-list"
        dataSource={messages}
        renderItem={(m) => (
          <List.Item className="card guestbook-item">
            <List.Item.Meta
              avatar={
                <div className="guestbook-avatar">{m.nickname.slice(0, 1).toUpperCase()}</div>
              }
              title={
                <span className="guestbook-meta">
                  {m.nickname}
                  <span className="meta">{dayjs(m.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                </span>
              }
              description={<span className="guestbook-content">{m.content}</span>}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
