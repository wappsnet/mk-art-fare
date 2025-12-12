import { createBrowserRouter, RouterProvider, RouteObject } from 'react-router';
import { publicRoutes } from './publicRoutes';
import { userRoutes } from './userRoutes';
import { adminRoutes } from './adminRoutes';
import { shopRoutes } from './shopRoutes';

const router = createBrowserRouter(
  [
    ...(publicRoutes as RouteObject[]),
    ...(userRoutes as RouteObject[]),
    ...(adminRoutes as RouteObject[]),
    ...(shopRoutes as RouteObject[]),
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
