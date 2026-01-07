import { useMemo } from 'react';

import ArticleIcon from '@mui/icons-material/Article';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

import {
  useGetBlogPostsQuery,
  useGetOrganizationsQuery,
  useGetUsersQuery,
} from '@/services/apiSlice.ts';

const AdminOverviewPage = () => {
  const { data: users } = useGetUsersQuery();
  const { data: organizations } = useGetOrganizationsQuery();
  const { data: posts } = useGetBlogPostsQuery({});

  const stats = useMemo(
    () => ({
      totalUsers: users?.pagination?.total ?? 0,
      totalOrganizations: organizations?.pagination?.total ?? 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalBlogPosts: posts?.pagination?.total ?? 0,
    }),
    [users?.pagination?.total, organizations?.pagination?.total, posts?.pagination?.total]
  );

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <GroupIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4">{stats.totalUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <StorefrontIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4">{stats.totalOrganizations}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Shops
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <ShoppingBagIcon sx={{ fontSize: 40, color: 'error.main' }} />
              <Box>
                <Typography variant="h4">{stats.totalOrders}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <AttachMoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4">${stats.totalRevenue.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <ArticleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              <Box>
                <Typography variant="h4">{stats.totalBlogPosts}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Blog Posts
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminOverviewPage;
