import { ChangeEvent, FC, useState } from 'react';

import { TablePagination, Chip, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router';

import AppDataTable, { Column } from '@/components/AppDataTable';
import { useGetOrganizationOrdersQuery } from '@/services/apiSlice';
import { Order } from '@/types/common';
import { getStatusTheme } from '@/utils/themeHelpers.ts';

const ShopOrdersPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: ordersData } = useGetOrganizationOrdersQuery(
    { organizationId: orgId, page: 1, limit: 50 },
    { skip: !orgId }
  );

  const orders = ordersData?.data?.data || [];

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  const columns: Column<Order>[] = [
    {
      id: 'order_number',
      label: 'Order #',
      render: (order) => <Typography variant="body2">{order.order_number}</Typography>,
    },
    {
      id: 'products',
      label: 'Products',
      render: (order) => {
        const productNames = order.items?.map((item) => item.product_name).join(', ') || '-';
        return (
          <Typography variant="body2" noWrap>
            {productNames}
          </Typography>
        );
      },
    },
    {
      id: 'product_items',
      label: 'Product Items',
      render: (order) => <Typography variant="body2">{order.items?.length || 0}</Typography>,
    },
    {
      id: 'tickets',
      label: 'Tickets',
      render: () => <Typography variant="body2">0</Typography>,
    },
    {
      id: 'total',
      label: 'Total',
      render: (order) => <Typography variant="body2">${order.total.toFixed(2)}</Typography>,
    },
    {
      id: 'status',
      label: 'Status',
      render: (order) => (
        <Chip
          label={order.status.toUpperCase()}
          color={getStatusColor(order.status)}
          size="small"
        />
      ),
    },
    {
      id: 'date',
      label: 'Date',
      render: (order) => (
        <Typography variant="body2">{new Date(order.created_at).toLocaleDateString()}</Typography>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Recent Orders</Typography>

      <AppDataTable
        columns={columns}
        data={paginatedOrders}
        getRowKey={(order) => order.id}
        emptyContent={<Typography color="text.secondary">No orders found</Typography>}
      />

      <TablePagination
        component="div"
        count={orders.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Stack>
  );
};

export default ShopOrdersPage;
