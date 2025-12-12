import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAppSelector } from '@/hooks/useRedux';
import { UserRole } from '@/types';

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export const RequireRole = ({
  children,
  allowedRoles,
  fallbackPath = '/',
}: RequireRoleProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
