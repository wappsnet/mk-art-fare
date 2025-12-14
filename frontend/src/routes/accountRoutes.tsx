import type { AppRouteObject } from '@/types/routes';
import { RequireAuth } from '@/components/guards';
import { AccountPage } from '@/pages/account/AccountPage';
import { ProfilePage } from '@/pages/account/ProfilePage';
import { ChangePasswordPage } from '@/pages/account/ChangePasswordPage';
import { MyOrdersPage } from '@/pages/account/MyOrdersPage';
import { MyEventsPage } from '@/pages/account/MyEventsPage';
import { MyTicketsPage } from '@/pages/account/MyTicketsPage';

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
      },
      {
        path: 'profile',
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
        path: 'events',
        element: <MyEventsPage />,
        meta: { title: 'My Events - Account' },
      },
      {
        path: 'tickets',
        element: <MyTicketsPage />,
        meta: { title: 'My Tickets - Account' },
      },
    ],
  },
];
