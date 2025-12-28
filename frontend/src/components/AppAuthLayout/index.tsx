import { FC, ReactNode } from 'react';

import { Box, Card, Stack } from '@mui/material';
import { Link } from 'react-router';

import logo from '@/assets/base/logo.svg';

interface LayoutProps {
  children: ReactNode;
}

const AppAuthLayout: FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Stack
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{ p: 1 }}
      >
        <Link to="/">
          <img src={logo} alt="Logo" style={{ width: 150 }} />
        </Link>
        <Card
          sx={{
            width: '100%',
            maxWidth: 450,
            p: 3,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          }}
        >
          {children}
        </Card>
      </Stack>
    </Box>
  );
};

export default AppAuthLayout;
