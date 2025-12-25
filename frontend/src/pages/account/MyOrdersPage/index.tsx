import { Card, Table, Tag, Typography, Empty, Space } from 'antd';
import dayjs from 'dayjs';

import { useGetOrdersQuery } from '@/services/apiSlice';
import { Order, OrderStatus } from '@/types/common';

import { OrdersContainerStyled, PriceTextStyled, EmptyIconStyled } from './styles';

const { Title, Text } = Typography;

const MyOrdersPage = () => {
  const { data: ordersData, isLoading } = useGetOrdersQuery();
  const orders = ordersData?.data || [];

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (orderNumber: string) => <Text strong>#{orderNumber}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: Order, b: Order) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: Order['items']) => items?.length || 0,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <PriceTextStyled strong>${total?.toFixed(2) || '0.00'}</PriceTextStyled>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => {
        const colorMap: Record<OrderStatus, string> = {
          [OrderStatus.PENDING]: 'warning',
          [OrderStatus.PROCESSING]: 'processing',
          [OrderStatus.SHIPPED]: 'blue',
          [OrderStatus.DELIVERED]: 'success',
          [OrderStatus.CANCELLED]: 'error',
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Pending', value: OrderStatus.PENDING },
        { text: 'Processing', value: OrderStatus.PROCESSING },
        { text: 'Shipped', value: OrderStatus.SHIPPED },
        { text: 'Delivered', value: OrderStatus.DELIVERED },
        { text: 'Cancelled', value: OrderStatus.CANCELLED },
      ],
      onFilter: (value: unknown, record: Order) => record.status === value,
    },
  ];

  return (
    <OrdersContainerStyled>
      {orders.length > 0 ? (
        <Card>
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ) : (
        <Card>
          <Empty
            image={<EmptyIconStyled />}
            description={
              <Space direction="vertical">
                <Title level={4}>No orders yet</Title>
                <Text type="secondary">Your order history will appear here</Text>
              </Space>
            }
          />
        </Card>
      )}
    </OrdersContainerStyled>
  );
};

export default MyOrdersPage;
