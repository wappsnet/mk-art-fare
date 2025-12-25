import type { UserRole } from './common';
import type { RouteObject } from 'react-router';

export interface RouteMeta {
  requiresAuth?: boolean;
  requiresGuest?: boolean;
  allowedRoles?: UserRole[];
  title?: string;
  description?: string;
}

export type AppRouteObject = RouteObject & {
  meta?: RouteMeta;
  children?: AppRouteObject[];
};
