import { RequireRole } from '@/guards';
import AdminBlogPostsPage from '@/pages/admin/AdminBlogPostsPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminOrganizationsPage from '@/pages/admin/AdminOrganizationsPage';
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage';
import AdminPage from '@/pages/admin/AdminPage';
import AdminPageEditPage from '@/pages/admin/AdminPageEditPage';
import AdminPagesListPage from '@/pages/admin/AdminPagesListPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
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
    children: [
      {
        index: true,
        element: (
          <RequireRole allowedRoles={[UserRole.ADMIN]}>
            <AdminOverviewPage />
          </RequireRole>
        ),
        meta: {
          requiresAuth: true,
          allowedRoles: [UserRole.ADMIN],
          title: 'Overview',
        },
      },
      {
        path: 'organizations',
        element: (
          <RequireRole allowedRoles={[UserRole.ADMIN]}>
            <AdminOrganizationsPage />
          </RequireRole>
        ),
        meta: {
          requiresAuth: true,
          allowedRoles: [UserRole.ADMIN],
          title: 'Organizations',
        },
      },
      {
        path: 'products',
        element: (
          <RequireRole allowedRoles={[UserRole.ADMIN]}>
            <AdminProductsPage />
          </RequireRole>
        ),
        meta: {
          requiresAuth: true,
          allowedRoles: [UserRole.ADMIN],
          title: 'Products',
        },
      },
      {
        path: 'users',
        element: (
          <RequireRole allowedRoles={[UserRole.ADMIN]}>
            <AdminUsersPage />
          </RequireRole>
        ),
        meta: {
          requiresAuth: true,
          allowedRoles: [UserRole.ADMIN],
          title: 'All Users',
        },
      },
      {
        path: 'orders',
        element: (
          <RequireRole allowedRoles={[UserRole.ADMIN]}>
            <AdminOrdersPage />
          </RequireRole>
        ),
        meta: {
          requiresAuth: true,
          allowedRoles: [UserRole.ADMIN],
          title: 'All Orders',
        },
      },
      {
        path: 'posts',
        element: (
          <RequireRole allowedRoles={[UserRole.ADMIN]}>
            <AdminBlogPostsPage />
          </RequireRole>
        ),
        meta: {
          requiresAuth: true,
          allowedRoles: [UserRole.ADMIN],
          title: 'Posts',
        },
      },
      {
        path: 'pages',
        element: (
          <RequireRole allowedRoles={[UserRole.ADMIN]}>
            <AdminPagesListPage />
          </RequireRole>
        ),
        meta: {
          requiresAuth: true,
          allowedRoles: [UserRole.ADMIN],
          title: 'Pages',
        },
        children: [
          {
            path: ':id/edit',
            element: (
              <RequireRole allowedRoles={[UserRole.ADMIN]}>
                <AdminPageEditPage />
              </RequireRole>
            ),
            meta: {
              requiresAuth: true,
              allowedRoles: [UserRole.ADMIN],
              title: 'Edit Page',
            },
          },
        ],
      },
    ],
  },
];
