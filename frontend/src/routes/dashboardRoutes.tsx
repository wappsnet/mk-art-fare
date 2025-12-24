import type { AppRouteObject } from '@/types/routes';
import { RequireAuth, RequireRole } from '@/guards';
import { UserRole } from '@/types/common';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ShopManagementPage from '@/pages/dashboard/ShopManagementPage';
import ShopProductsPage from '@/pages/dashboard/ShopProductsPage';
import ShopOrdersPage from '@/pages/dashboard/ShopOrdersPage';
import ShopAnalyticsPage from '@/pages/dashboard/ShopAnalyticsPage';
import ShopCategoriesPage from '@/pages/dashboard/ShopCategoriesPage';
import ShopSettingsPage from '@/pages/dashboard/ShopSettingsPage';

export const dashboardRoutes: AppRouteObject[] = [
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    ),
    meta: { requiresAuth: true, title: 'Dashboard - Art Fare' },
  },
  {
    path: '/dashboard/shop/:id',
    element: (
      <RequireRole allowedRoles={[UserRole.ARTIST, UserRole.ADMIN]}>
        <ShopManagementPage />
      </RequireRole>
    ),
    meta: { requiresAuth: true, allowedRoles: [UserRole.ARTIST, UserRole.ADMIN] },
    children: [
      {
        index: true,
        element: <ShopSettingsPage />,
        meta: { title: 'Settings - Shop Management' },
      },
      {
        path: 'products',
        element: <ShopProductsPage />,
        meta: { title: 'Products - Shop Management' },
      },
      {
        path: 'categories',
        element: <ShopCategoriesPage />,
        meta: { title: 'Categories - Shop Management' },
      },
      {
        path: 'orders',
        element: <ShopOrdersPage />,
        meta: { title: 'Orders - Shop Management' },
      },
      {
        path: 'analytics',
        element: <ShopAnalyticsPage />,
        meta: { title: 'Analytics - Shop Management' },
      },
    ],
  },
];
