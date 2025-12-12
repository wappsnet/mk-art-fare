import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAppSelector } from '@/hooks/useRedux';

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}

export const RequireAuth = ({ children, redirectTo = '/login' }: RequireAuthProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
