import { FC, useMemo, SyntheticEvent } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
  Box,
  Container,
} from '@mui/material';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router';

import AppLayout from '@/components/AppLayout';
import { useGetOrganizationByIdQuery } from '@/services/apiSlice';

const ShopManagementPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = Number.parseInt(id!);

  const { data: orgData, isLoading } = useGetOrganizationByIdQuery(orgId, { skip: !orgId });
  const organization = orgData?.data;

  const handleTabChange = (_: SyntheticEvent, path: string) => {
    navigate(path);
  };

  const tabItems = useMemo(
    () => [
      {
        value: `/dashboard/shop/${id}`,
        label: 'Settings',
      },
      {
        value: `/dashboard/shop/${id}/products`,
        label: 'Products',
      },
      {
        value: `/dashboard/shop/${id}/categories`,
        label: 'Categories',
      },
      {
        value: `/dashboard/shop/${id}/orders`,
        label: 'Orders',
      },
      {
        value: `/dashboard/shop/${id}/analytics`,
        label: 'Analytics',
      },
      {
        value: `/dashboard/shop/${id}/custom-fields`,
        label: 'Custom Fields',
      },
    ],
    [id]
  );

  if (isLoading) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress size={60} />
          </Box>
        </Container>
      </AppLayout>
    );
  }

  if (organization === null || organization === undefined) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h5">Organization not found</Typography>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h3">Manage {organization.name}</Typography>
          </Box>

          <Card>
            <Tabs
              variant="scrollable"
              scrollButtons={true}
              value={location.pathname}
              onChange={handleTabChange}
            >
              {tabItems.map((item) => (
                <Tab key={item.value} label={item.label} value={item.value} />
              ))}
            </Tabs>

            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </AppLayout>
  );
};

export default ShopManagementPage;
