import { createBrowserRouter, RouterProvider } from 'react-router';
import { publicRoutes } from './publicRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { accountRoutes } from './accountRoutes';
import { adminRoutes } from './adminRoutes';
import { convertRoutes } from '@/utils/routeHelpers.ts';

const router = createBrowserRouter(
  [
    ...convertRoutes(publicRoutes),
    ...convertRoutes(dashboardRoutes),
    ...convertRoutes(accountRoutes),
    ...convertRoutes(adminRoutes),
    {
      path: '*',
      element: <div>404 - Page Not Found</div>,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

export const AppRouter = () => <RouterProvider router={router} />;
