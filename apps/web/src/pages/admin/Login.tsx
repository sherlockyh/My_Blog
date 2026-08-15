import { Button, Card, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth';

export default function AdminLogin() {
  const { t } = useTranslation();
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const submit = async () => {
    const values = await form.validateFields();
    const res = await api.login(values);
    setToken(res.token);
    message.success(t('admin.loginOk'));
    navigate('/admin');
  };

  return (
    <div className="login-page">
      <Card className="login-card" title="Code with Joy · Admin">
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="username" label={t('admin.username')} rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label={t('admin.password')} rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block className="btn-gradient">
            {t('admin.loginBtn')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
