import { ReactNode } from 'react';

import { Navigate } from 'react-router';

import { useAppSelector } from '@/hooks/useRedux.ts';

interface RequireGuestProps {
  children: ReactNode;
  redirectTo?: string;
}

export const RequireGuest = ({ children, redirectTo = '/dashboard' }: RequireGuestProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
