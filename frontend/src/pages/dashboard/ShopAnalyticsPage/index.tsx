import { FC } from 'react';

import { Grid, Card, CardContent, Typography, Chip, Stack, Box } from '@mui/material';
import { useParams } from 'react-router';

import { useGetOrganizationStatsQuery } from '@/services/apiSlice';
import { getStatusTheme } from '@/utils/themeHelpers.ts';

const ShopAnalyticsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const { data: statsData } = useGetOrganizationStatsQuery(orgId, { skip: !orgId });
  const stats = statsData?.data;

  const getStatusColor = (
    status: string
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const theme = getStatusTheme(status);
    const colorMap: Record<
      string,
      'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
    > = {
      success: 'success',
      processing: 'info',
      warning: 'warning',
      error: 'error',
      default: 'default',
      blue: 'primary',
    };
    return colorMap[theme] || 'default';
  };

  return (
    <Stack spacing={3}>
      {/* Main Stats */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {stats?.total?.total_orders || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                ${(stats?.total?.total_revenue || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {stats?.total?.total_items_sold || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Products Sold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                $
                {(
                  Number.parseFloat(String(stats?.total?.total_revenue || 0)) /
                  (stats?.total?.total_orders || 1)
                ).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Order Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Orders by Status
              </Typography>
              {stats?.byStatus && stats.byStatus.length > 0 ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {stats.byStatus.map((item) => (
                    <Box
                      key={item.status}
                      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Chip
                        label={item.status.toUpperCase()}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                      <Typography variant="body2">
                        {item.count} orders (${item.revenue.toFixed(2)})
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Selling Products
              </Typography>
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {stats.topProducts.map((product) => (
                    <Box
                      key={product.name}
                      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <Typography variant="body2">
                        {product.total_sold} sold (${product.revenue.toFixed(2)})
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ShopAnalyticsPage;
