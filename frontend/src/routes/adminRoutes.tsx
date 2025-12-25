import { RequireRole } from '@/guards';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminOrganizationModerationPage from '@/pages/admin/AdminOrganizationModerationPage';
import AdminPage from '@/pages/admin/AdminPage';
import AdminProductModerationPage from '@/pages/admin/AdminProductModerationPage';
import { UserRole } from '@/types/common';

import type { AppRouteObject } from '@/types/routes';

export const adminRoutes: AppRouteObject[] = [
  {
    path: '/admin',
    element: (
      <RequireRole allowedRoles={[UserRole.ADMIN]}>
        <AdminPage />
      </RequireRole>
    ),
    meta: {
      requiresAuth: true,
      allowedRoles: [UserRole.ADMIN],
      title: 'Admin Dashboard - Art Fare',
    },
  },
  {
    path: '/admin/organizations',
    element: (
      <RequireRole allowedRoles={[UserRole.ADMIN]}>
        <AdminOrganizationModerationPage />
      </RequireRole>
    ),
    meta: {
      requiresAuth: true,
      allowedRoles: [UserRole.ADMIN],
      title: 'Organization Moderation - Art Fare',
    },
  },
  {
    path: '/admin/products',
    element: (
      <RequireRole allowedRoles={[UserRole.ADMIN]}>
        <AdminProductModerationPage />
      </RequireRole>
    ),
    meta: {
      requiresAuth: true,
      allowedRoles: [UserRole.ADMIN],
      title: 'Product Moderation - Art Fare',
    },
  },
  {
    path: '/admin/orders',
    element: (
      <RequireRole allowedRoles={[UserRole.ADMIN]}>
        <AdminOrdersPage />
      </RequireRole>
    ),
    meta: {
      requiresAuth: true,
      allowedRoles: [UserRole.ADMIN],
      title: 'All Orders - Art Fare',
    },
  },
];
