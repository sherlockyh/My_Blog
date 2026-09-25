import { Navigate, useRoutes, type RouteObject } from 'react-router-dom';
import { adminRoutes } from '@/admin/routes';
import { blogRoutes } from '@/blog/routes';

const routes: RouteObject[] = [
  ...blogRoutes,
  ...adminRoutes,
  { path: '*', element: <Navigate to="/" replace /> },
];

export default function AppRoutes() {
  return useRoutes(routes);
}
