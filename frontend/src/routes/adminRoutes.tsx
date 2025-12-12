import { AppRouteObject } from './types';
import { RequireRole } from '@/components/guards';
import { UserRole } from '@/types';
import { AdminPage } from '@/pages/admin/AdminPage';
import { AdminEventModerationPage } from '@/pages/admin/AdminEventModerationPage';

export const adminRoutes: AppRouteObject[] = [
  {
    path: '/admin',
    element: (
      <RequireRole allowedRoles={[UserRole.ADMIN]}>
        <AdminPage />
      </RequireRole>
    ),
    meta: { requiresAuth: true, allowedRoles: [UserRole.ADMIN], title: 'Admin Dashboard - Art Fare' },
  },
  {
    path: '/admin/event-moderation',
    element: (
      <RequireRole allowedRoles={[UserRole.ADMIN]}>
        <AdminEventModerationPage />
      </RequireRole>
    ),
    meta: { requiresAuth: true, allowedRoles: [UserRole.ADMIN], title: 'Event Moderation - Art Fare' },
  },
];
