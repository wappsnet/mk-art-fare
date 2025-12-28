import { RequireRole } from '@/guards';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminOrganizationsPage from '@/pages/admin/AdminOrganizationsPage';
import AdminPage from '@/pages/admin/AdminPage';
import AdminPageEditPage from '@/pages/admin/AdminPageEditPage';
import AdminPagesListPage from '@/pages/admin/AdminPagesListPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
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
        <AdminOrganizationsPage />
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
        <AdminProductsPage />
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
  {
    path: '/admin/pages',
    element: (
      <RequireRole allowedRoles={[UserRole.ADMIN]}>
        <AdminPagesListPage />
      </RequireRole>
    ),
    meta: {
      requiresAuth: true,
      allowedRoles: [UserRole.ADMIN],
      title: 'Page Management - Art Fare',
    },
  },
  {
    path: '/admin/pages/:id/edit',
    element: (
      <RequireRole allowedRoles={[UserRole.ADMIN]}>
        <AdminPageEditPage />
      </RequireRole>
    ),
    meta: {
      requiresAuth: true,
      allowedRoles: [UserRole.ADMIN],
      title: 'Edit Page - Art Fare',
    },
  },
];
