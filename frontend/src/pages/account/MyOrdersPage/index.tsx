import { ChangeEvent, FC, useState, useMemo } from 'react';

import {
  Card,
  TablePagination,
  TableSortLabel,
  Chip,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import dayjs from 'dayjs';

import AppDataTable, { Column } from '@/components/AppDataTable';
import EmptyState from '@/components/EmptyState';
import { useGetOrdersQuery } from '@/services/apiSlice';
import { Order, OrderStatus } from '@/types/common';

const MyOrdersPage: FC = () => {
  const { data: ordersData, isLoading } = useGetOrdersQuery();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const orders = useMemo(() => ordersData?.data || [], [ordersData?.data]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSortToggle = () => {
    setOrderBy(orderBy === 'asc' ? 'desc' : 'asc');
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as OrderStatus | 'all');
    setPage(0);
  };

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Sort by date
    return result.toSorted((a, b) => {
      const dateA = dayjs(a.created_at).unix();
      const dateB = dayjs(b.created_at).unix();
      return orderBy === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [orders, statusFilter, orderBy]);

  const paginatedOrders = useMemo(() => {
    return filteredAndSortedOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAndSortedOrders, page, rowsPerPage]);

  const getStatusColor = (
    status: OrderStatus
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colorMap: Record<
      OrderStatus,
      'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
    > = {
      [OrderStatus.PENDING]: 'warning',
      [OrderStatus.PROCESSING]: 'info',
      [OrderStatus.SHIPPED]: 'primary',
      [OrderStatus.DELIVERED]: 'success',
      [OrderStatus.CANCELLED]: 'error',
    };
    return colorMap[status];
  };

  const columns: Column<Order>[] = [
    {
      id: 'order_number',
      label: 'Order #',
      render: (order) => (
        <Typography variant="body2" fontWeight="bold">
          #{order.order_number}
        </Typography>
      ),
    },
    {
      id: 'created_at',
      label: 'Date',
      renderHeader: () => (
        <TableSortLabel active direction={orderBy} onClick={handleSortToggle}>
          <Typography variant="subtitle2" fontWeight="bold">
            Date
          </Typography>
        </TableSortLabel>
      ),
      render: (order) => (
        <Typography variant="body2">{dayjs(order.created_at).format('MMM DD, YYYY')}</Typography>
      ),
    },
    {
      id: 'items',
      label: 'Items',
      render: (order) => <Typography variant="body2">{order.items?.length || 0}</Typography>,
    },
    {
      id: 'total',
      label: 'Total',
      render: (order) => (
        <Typography variant="body2" color="primary" fontWeight="bold">
          ${order.total?.toFixed(2) || '0.00'}
        </Typography>
      ),
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
  ];

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select value={statusFilter} onChange={handleStatusFilterChange} label="Filter by Status">
            <MenuItem value="all">All Orders</MenuItem>
            <MenuItem value={OrderStatus.PENDING}>Pending</MenuItem>
            <MenuItem value={OrderStatus.PROCESSING}>Processing</MenuItem>
            <MenuItem value={OrderStatus.SHIPPED}>Shipped</MenuItem>
            <MenuItem value={OrderStatus.DELIVERED}>Delivered</MenuItem>
            <MenuItem value={OrderStatus.CANCELLED}>Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <AppDataTable
        columns={columns}
        data={paginatedOrders}
        isLoading={isLoading}
        getRowKey={(order) => order.id}
        emptyContent={
          <EmptyState title="No orders yet" description="Your order history will appear here" />
        }
      />

      <TablePagination
        component="div"
        count={filteredAndSortedOrders.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};

export default MyOrdersPage;
