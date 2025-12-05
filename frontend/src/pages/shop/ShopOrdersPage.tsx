import { useParams } from 'react-router-dom';
import { Table, Tag, Typography } from 'antd';
import { useGetOrganizationOrdersQuery } from '@/services/apiSlice';

const { Title, Text } = Typography;

export const ShopOrdersPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = parseInt(id!);

  const { data: ordersData } = useGetOrganizationOrdersQuery(
    { organizationId: orgId, page: 1, limit: 50 },
    { skip: !orgId }
  );

  const orders = ordersData?.data?.data || [];

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Products',
      dataIndex: 'products',
      key: 'products',
      ellipsis: true,
      render: (products: string) => products || '-',
    },
    {
      title: 'Events',
      dataIndex: 'events',
      key: 'events',
      ellipsis: true,
      render: (events: string) => events || '-',
    },
    {
      title: 'Product Items',
      dataIndex: 'product_items',
      key: 'product_items',
      render: (count: number) => count || 0,
    },
    {
      title: 'Tickets',
      dataIndex: 'ticket_items',
      key: 'ticket_items',
      render: (count: number) => count || 0,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: string) => `$${parseFloat(total).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={
            status === 'completed'
              ? 'green'
              : status === 'pending'
                ? 'gold'
                : status === 'cancelled'
                  ? 'red'
                  : 'blue'
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Recent Orders</Title>
      <Table
        dataSource={orders}
        rowKey="id"
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
