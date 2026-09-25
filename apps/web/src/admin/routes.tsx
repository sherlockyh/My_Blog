import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// 后台页面和 Markdown 编辑器依赖较重，路由级懒加载保证访客首包不含这些代码。
const AdminLogin = lazy(() => import('./pages/Login'));
const AdminLayout = lazy(() => import('./layout/AdminLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminArticles = lazy(() => import('./pages/Articles'));
const AdminProjects = lazy(() => import('./pages/Projects'));
const AdminResources = lazy(() => import('./pages/Resources'));
const AdminMessages = lazy(() => import('./pages/Messages'));
const AdminSiteConfig = lazy(() => import('./pages/SiteConfig'));
const AdminProfile = lazy(() => import('./pages/Profile'));

export const adminRoutes: RouteObject[] = [
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'articles', element: <AdminArticles /> },
      { path: 'projects', element: <AdminProjects /> },
      { path: 'resources', element: <AdminResources /> },
      { path: 'messages', element: <AdminMessages /> },
      { path: 'site-config', element: <AdminSiteConfig /> },
      { path: 'profile', element: <AdminProfile /> },
    ],
  },
];
