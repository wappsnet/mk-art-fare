import { useState } from 'react';
import { Card, Table, Tag, Typography, Space, Statistic, Row, Col, Select } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AppLayout from '@/components/AppLayout';
import { useGetOrdersQuery } from '@/services/apiSlice';
import { Order, OrderStatus } from '@/types/common';
import { ContainerStyled, HeaderStyled, StatCardStyled } from './styles';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminOrdersPage = () => {
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

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (record: Order) => (
        <div>
          <Text>{record.user_id}</Text>
        </div>
      ),
    },
    {
      title: 'Organization',
      key: 'organization',
      render: (record: Order) => (
        <div>
          <Text>{record.organization_id}</Text>
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ${amount?.toFixed(2) || '0.00'}
        </Text>
      ),
      sorter: (a: Order, b: Order) => (a.total_amount || 0) - (b.total_amount || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'warning',
          processing: 'processing',
          shipped: 'blue',
          delivered: 'success',
          completed: 'success',
          cancelled: 'error',
        };
        return <Tag color={colorMap[status] || 'default'}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Payment Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'warning',
          paid: 'success',
          failed: 'error',
          refunded: 'default',
        };
        return <Tag color={colorMap[status] || 'default'}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Order Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY HH:mm'),
      sorter: (a: Order, b: Order) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      defaultSortOrder: 'descend' as const,
    },
  ];

  return (
    <AppLayout>
      <ContainerStyled>
        <HeaderStyled>
          <div>
            <Title level={2}>
              <ShoppingOutlined /> All Orders
            </Title>
            <Text type="secondary">View and manage all platform orders</Text>
          </div>
        </HeaderStyled>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCardStyled>
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </StatCardStyled>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCardStyled>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </StatCardStyled>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCardStyled>
              <Statistic
                title="Pending Orders"
                value={stats.pendingOrders}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </StatCardStyled>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCardStyled>
              <Statistic
                title="Completed Orders"
                value={stats.completedOrders}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </StatCardStyled>
          </Col>
        </Row>

        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space>
              <Text strong>Filter by status:</Text>
              <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 200 }}>
                <Option value="all">All Orders</Option>
                <Option value="pending">Pending</Option>
                <Option value="processing">Processing</Option>
                <Option value="shipped">Shipped</Option>
                <Option value="delivered">Delivered</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Space>

            <Table
              dataSource={filteredOrders}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              pagination={{ pageSize: 20, showSizeChanger: true }}
            />
          </Space>
        </Card>
      </ContainerStyled>
    </AppLayout>
  );
};

export default AdminOrdersPage;
