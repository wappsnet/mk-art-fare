import { AppRouteObject } from './types';
import { RequireRole } from '@/components/guards';
import { UserRole } from '@/types';
import { ShopManagementPage } from '@/pages/shop/ShopManagementPage';
import { ShopProductsPage } from '@/pages/shop/ShopProductsPage';
import { ShopEventsPage } from '@/pages/shop/ShopEventsPage';
import { ShopOrdersPage } from '@/pages/shop/ShopOrdersPage';
import { ShopAnalyticsPage } from '@/pages/shop/ShopAnalyticsPage';
import { ShopCategoriesPage } from '@/pages/shop/ShopCategoriesPage';
import { ShopSettingsPage } from '@/pages/shop/ShopSettingsPage';

export const shopRoutes: AppRouteObject[] = [
  {
    path: '/admin/shop/:id',
    element: (
      <RequireRole allowedRoles={[UserRole.ARTIST, UserRole.ADMIN]}>
        <ShopManagementPage />
      </RequireRole>
    ),
    meta: { requiresAuth: true, allowedRoles: [UserRole.ARTIST, UserRole.ADMIN] },
    children: [
      {
        index: true,
        element: <ShopProductsPage />,
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
        path: 'events',
        element: <ShopEventsPage />,
        meta: { title: 'Events - Shop Management' },
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
      {
        path: 'settings',
        element: <ShopSettingsPage />,
        meta: { title: 'Settings - Shop Management' },
      },
    ],
  },
];
