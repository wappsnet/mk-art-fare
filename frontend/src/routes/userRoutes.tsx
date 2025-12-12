import { AppRouteObject } from './types';
import { RequireAuth } from '@/components/guards';
import { DashboardPage } from '@/pages/user/DashboardPage';
import { MyEventsPage } from '@/pages/user/MyEventsPage';
import { MyTicketsPage } from '@/pages/user/MyTicketsPage';

export const userRoutes: AppRouteObject[] = [
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
    path: '/my-events',
    element: (
      <RequireAuth>
        <MyEventsPage />
      </RequireAuth>
    ),
    meta: { requiresAuth: true, title: 'My Events - Art Fare' },
  },
  {
    path: '/my-tickets',
    element: (
      <RequireAuth>
        <MyTicketsPage />
      </RequireAuth>
    ),
    meta: { requiresAuth: true, title: 'My Tickets - Art Fare' },
  },
];
