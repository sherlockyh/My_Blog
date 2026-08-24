import { Navigate, useRoutes, type RouteObject } from 'react-router-dom';
import { adminRoutes } from './adminRoutes';
import { publicRoutes } from './publicRoutes';

const routes: RouteObject[] = [
  ...publicRoutes,
  ...adminRoutes,
  { path: '*', element: <Navigate to="/" replace /> },
];

export default function AppRoutes() {
  return useRoutes(routes);
}
