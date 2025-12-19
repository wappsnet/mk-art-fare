import { createBrowserRouter, RouterProvider } from 'react-router';
import { publicRoutes } from './publicRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { accountRoutes } from './accountRoutes';
import { adminRoutes } from './adminRoutes';
import { convertRoutes } from '@/utils/routeHelpers.ts';
import NotFoundPage from '@/pages/errors/NotFoundPage';
import ForbiddenPage from '@/pages/errors/ForbiddenPage';

const router = createBrowserRouter(
  [
    ...convertRoutes(publicRoutes),
    ...convertRoutes(dashboardRoutes),
    ...convertRoutes(accountRoutes),
    ...convertRoutes(adminRoutes),
    {
      path: '/403',
      element: <ForbiddenPage />,
    },
    {
      path: '*',
      element: <NotFoundPage />,
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
