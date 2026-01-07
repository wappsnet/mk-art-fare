import { ReactNode } from 'react';

import { useAppSelector } from '@/hooks/useRedux.ts';
import { UserRole } from '@/types/common.ts';

interface AccessWrapperProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export const AccessWrapper = ({ children, allowedRoles, fallback = null }: AccessWrapperProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // If user is authenticated and has one of the allowed roles, show children
  if (isAuthenticated && user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Otherwise, show fallback (defaults to null)
  return <>{fallback}</>;
};
