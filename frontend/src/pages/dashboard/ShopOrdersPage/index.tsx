import { Table, Tag } from 'antd';
import { useParams } from 'react-router';

import { useGetOrganizationOrdersQuery } from '@/services/apiSlice';
import { getStatusTheme } from '@/utils/themeHelpers.ts';

import { PageTitleStyled } from './styles';

const ShopOrdersPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

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
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusTheme(status)}>{status.toUpperCase()}</Tag>,
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
      <PageTitleStyled level={4}>Recent Orders</PageTitleStyled>
      <Table dataSource={orders} rowKey="id" columns={columns} pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default ShopOrdersPage;
