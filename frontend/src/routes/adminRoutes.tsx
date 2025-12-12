import type { AppRouteObject } from '@/types/routes';
import { RequireRole } from '@/components/guards';
import { UserRole } from '@/types/common';
import { AdminPage } from '@/pages/admin/AdminPage';
import { AdminEventModerationPage } from '@/pages/admin/AdminEventModerationPage';
import { AdminOrganizationModerationPage } from '@/pages/admin/AdminOrganizationModerationPage';
import { AdminProductModerationPage } from '@/pages/admin/AdminProductModerationPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';

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
    path: '/admin/events',
    element: (
      <RequireRole allowedRoles={[UserRole.ADMIN]}>
        <AdminEventModerationPage />
      </RequireRole>
    ),
    meta: {
      requiresAuth: true,
      allowedRoles: [UserRole.ADMIN],
      title: 'Event Moderation - Art Fare',
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
