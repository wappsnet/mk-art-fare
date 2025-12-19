import type { AppRouteObject } from '@/types/routes';
import { RequireAuth } from '@/guards';
import AccountPage from '@/pages/account/AccountPage';
import ProfilePage from '@/pages/account/ProfilePage';
import ChangePasswordPage from '@/pages/account/ChangePasswordPage';
import MyOrdersPage from '@/pages/account/MyOrdersPage';
import SubscriptionPage from '@/pages/account/SubscriptionPage';

export const accountRoutes: AppRouteObject[] = [
  {
    path: '/account',
    element: (
      <RequireAuth>
        <AccountPage />
      </RequireAuth>
    ),
    meta: {
      requiresAuth: true,
      title: 'Account - Art Fare',
    },
    children: [
      {
        index: true,
        element: <ProfilePage />,
        meta: { title: 'Profile - Account' },
      },
      {
        path: 'password',
        element: <ChangePasswordPage />,
        meta: { title: 'Change Password - Account' },
      },
      {
        path: 'orders',
        element: <MyOrdersPage />,
        meta: { title: 'My Orders - Account' },
      },
      {
        path: 'subscription',
        element: <SubscriptionPage />,
        meta: { title: 'Subscription - Account' },
      },
    ],
  },
];
