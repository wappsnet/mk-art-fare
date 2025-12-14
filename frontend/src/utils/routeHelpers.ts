import type { RouteObject } from 'react-router';
import type { AppRouteObject } from '@/types/routes.ts';
import { omit } from './commonHelpers.ts';

export const convertRoutes = (routes: AppRouteObject[]): RouteObject[] => {
  return routes.map((route): RouteObject => {
    if (route.index) {
      return omit(route, 'meta', 'children');
    }

    if (route.children) {
      const routeWithoutMeta = omit(route, 'meta');
      return {
        ...routeWithoutMeta,
        children: convertRoutes(route.children),
      };
    }

    return omit(route, 'meta', 'children');
  });
};
