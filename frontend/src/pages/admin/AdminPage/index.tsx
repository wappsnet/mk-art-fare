import { FC } from 'react';

import PersonIcon from '@mui/icons-material/Person';
import { Typography, Stack, Tabs, Tab, Box } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';

const AdminPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppLayout>
      <Box sx={{ py: 4, px: 3 }}>
        <Stack spacing={4}>
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PersonIcon /> Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Platform management and analytics
            </Typography>
          </Box>

          <Tabs
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            value={location.pathname}
            onChange={(_, path: string) => navigate(path)}
          >
            <Tab label="Overview" value="/admin" />
            <Tab label={`Users`} value="/admin/users" />
            <Tab label={`Shops`} value="/admin/organizations" />
            <Tab label={`Products`} value="/admin/products" />
            <Tab label={`Orders`} value="/admin/orders" />
            <Tab label={`Pages`} value="/admin/pages" />
            <Tab label={`Posts`} value="/admin/posts" />
          </Tabs>

          <Outlet />
        </Stack>
      </Box>
    </AppLayout>
  );
};

export default AdminPage;
