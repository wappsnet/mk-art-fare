import { RouteObject } from 'react-router';
import { UserRole } from '@/types';

export interface AppRouteObject extends Omit<RouteObject, 'children'> {
  meta?: {
    requiresAuth?: boolean;
    requiresGuest?: boolean;
    allowedRoles?: UserRole[];
    title?: string;
    description?: string;
  };
  children?: AppRouteObject[];
}
