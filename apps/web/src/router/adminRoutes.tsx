import type { RouteObject } from 'react-router-dom';
import {
  AdminArticles,
  AdminLayout,
  AdminLogin,
  AdminMessages,
  AdminProfile,
  AdminProjects,
  AdminResources,
  AdminSiteConfig,
  Dashboard,
} from './lazyPages';

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
