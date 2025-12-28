import { ReactNode } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router';

import { useAppSelector } from '@/hooks/useRedux.ts';
import { useGetProfileQuery } from '@/services/apiSlice';
import { UserRole } from '@/types/common.ts';

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export const RequireRole = ({ children, allowedRoles, fallbackPath = '/403' }: RequireRoleProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const token = localStorage.getItem('accessToken');
  const { isLoading } = useGetProfileQuery(undefined, { skip: !token });

  // Wait for profile to load if authenticated but user data not available yet
  if (isAuthenticated && !user && isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (isAuthenticated && user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Navigate to="/login" replace />;
};
