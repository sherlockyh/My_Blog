// 布局用途：承载后台管理页面的侧边栏、顶部栏和子路由出口。
import { Avatar, Button, Layout, Menu, message } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  ProjectOutlined,
  SettingOutlined,
  ShareAltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth';
import { useAdminDirtyStore } from '@/store/adminDirty';
import AdminThemeProvider from '@/components/admin/AdminThemeProvider';
import './styles/index.module.less';

export default function AdminLayout() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const clear = useAuthStore((s) => s.clear);
  const dirty = useAdminDirtyStore((s) => s.dirty);
  const navigate = useNavigate();
  const location = useLocation();

  if (!token) return <Navigate to="/admin/login" replace />;

  const items = [
    { key: '/admin', icon: <DashboardOutlined />, label: t('admin.dashboard') },
    { key: '/admin/articles', icon: <FileTextOutlined />, label: t('admin.articles') },
    { key: '/admin/projects', icon: <ProjectOutlined />, label: t('admin.projects') },
    { key: '/admin/resources', icon: <ShareAltOutlined />, label: t('admin.resources') },
    { key: '/admin/messages', icon: <MessageOutlined />, label: t('admin.messages') },
    { key: '/admin/site-config', icon: <SettingOutlined />, label: t('admin.siteConfig') },
    { key: '/admin/profile', icon: <UserOutlined />, label: t('admin.profile') },
  ];

  const selected =
    [...items]
      .sort((a, b) => b.key.length - a.key.length)
      .find((i) => (i.key === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(i.key)))?.key ||
    '/admin';

  const confirmLeave = () => {
    if (!dirty) return true;
    return window.confirm(t('admin.leaveConfirm'));
  };

  const clearDirty = () => useAdminDirtyStore.getState().setDirty(false);

  const guardedNavigate = (path: string) => {
    if (path === location.pathname) return;
    if (!confirmLeave()) return;
    clearDirty();
    navigate(path);
  };

  return (
    <AdminThemeProvider>
      <Layout className="admin-shell">
        <Layout.Sider className="admin-sider">
          <div className="admin-logo">
            <span>J</span>
            <strong>Code with Joy</strong>
          </div>
          <Menu mode="inline" selectedKeys={[selected]} items={items} onClick={({ key }) => guardedNavigate(String(key))} />
        </Layout.Sider>
        <Layout>
          <Layout.Header className="admin-header">
            <Link
              to="/"
              className="admin-back"
              onClick={(event) => {
                if (!confirmLeave()) {
                  event.preventDefault();
                  return;
                }
                clearDirty();
              }}
            >
              <HomeOutlined /> {t('admin.backHome')}
            </Link>
            <div className="admin-header-actions">
              <Avatar size={32} icon={<UserOutlined />} />
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={() => {
                  if (!confirmLeave()) return;
                  clearDirty();
                  clear();
                  message.success(t('admin.logout'));
                  navigate('/admin/login');
                }}
              >
                {t('admin.logout')}
              </Button>
            </div>
          </Layout.Header>
          <Layout.Content className="admin-content">
            <Outlet />
          </Layout.Content>
        </Layout>
      </Layout>
    </AdminThemeProvider>
  );
}
