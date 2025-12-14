import type { RouteObject } from 'react-router';
import type { UserRole } from './common';

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
