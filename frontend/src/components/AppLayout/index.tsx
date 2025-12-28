import { FC, ReactNode } from 'react';

import { Box } from '@mui/material';

import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';

interface LayoutProps {
  children: ReactNode;
}

const AppLayout: FC<LayoutProps> = ({ children }) => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppHeader />
      <Box component="main">{children}</Box>
      <AppFooter />
    </Box>
  );
};

export default AppLayout;
