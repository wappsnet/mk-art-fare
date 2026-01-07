import { FC, useState } from 'react';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Card,
  CardContent,
  Chip,
  Typography,
  Stack,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import dayjs from 'dayjs';

import AppDataTable, { Column } from '@/components/AppDataTable';
import { useGetOrdersQuery } from '@/services/apiSlice';
import { Order, OrderStatus } from '@/types/common';

const AdminOrdersPage: FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: ordersData, isLoading } = useGetOrdersQuery();
  const orders = ordersData?.data || [];

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((order) => order.status === statusFilter);

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum: number, order: Order) => sum + (order.total_amount || 0), 0),
    pendingOrders: orders.filter((o: Order) => o.status === OrderStatus.PENDING).length,
    completedOrders: orders.filter((o: Order) => o.status === OrderStatus.DELIVERED).length,
  };

  const getStatusColor = (status: string): 'default' | 'warning' | 'info' | 'success' | 'error' => {
    const colorMap: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colorMap[status] || 'default';
  };

  const getPaymentStatusColor = (status: string): 'default' | 'warning' | 'success' | 'error' => {
    const colorMap: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
      pending: 'warning',
      paid: 'success',
      failed: 'error',
      refunded: 'default',
    };
    return colorMap[status] || 'default';
  };

  const columns: Column<Order>[] = [
    {
      id: 'id',
      label: 'Order ID',
      render: (order) => (
        <Typography variant="body2" fontWeight="bold">
          #{order.id}
        </Typography>
      ),
    },
    {
      id: 'customer',
      label: 'Customer',
      render: (order) => <Typography variant="body2">{order.user_id}</Typography>,
    },
    {
      id: 'organization',
      label: 'Organization',
      render: (order) => <Typography variant="body2">{order.organization_id}</Typography>,
    },
    {
      id: 'total',
      label: 'Total',
      render: (order) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ${order.total_amount?.toFixed(2) || '0.00'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (order) => (
        <Chip
          label={order.status?.toUpperCase()}
          color={getStatusColor(order.status)}
          size="small"
        />
      ),
    },
    {
      id: 'payment_status',
      label: 'Payment Status',
      render: (order) => (
        <Chip
          label={order.payment_status?.toUpperCase() || 'N/A'}
          color={getPaymentStatusColor(order.payment_status || 'pending')}
          size="small"
        />
      ),
    },
    {
      id: 'created_at',
      label: 'Order Date',
      render: (order) => (
        <Typography variant="body2">
          {dayjs(order.created_at).format('MMM DD, YYYY HH:mm')}
        </Typography>
      ),
    },
  ];

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <ShoppingCartIcon /> All Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all platform orders
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4">{stats.pendingOrders}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Orders
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4">{stats.completedOrders}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Orders
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <FormControl sx={{ width: 200 }}>
              <InputLabel>Filter by status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by status"
              >
                <MenuItem value="all">All Orders</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <AppDataTable
              columns={columns}
              data={filteredOrders}
              isLoading={isLoading}
              getRowKey={(order) => order.id}
              emptyContent={<Typography color="text.secondary">No orders found</Typography>}
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AdminOrdersPage;
