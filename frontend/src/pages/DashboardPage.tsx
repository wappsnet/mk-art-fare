import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, Space, Tabs } from 'antd';
import { ShopOutlined, ShoppingOutlined, DollarOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { Layout } from '../components/Layout';
import { useAppSelector } from '../hooks/useRedux';
import { useGetOrdersQuery, useGetDashboardStatsQuery } from '../services/apiSlice';
import { Order } from '../types';

const { Title, Text } = Typography;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

const StatCard = styled(Card)`
  .ant-statistic-title {
    color: #666;
  }
`;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const { data: statsData } = useGetDashboardStatsQuery();
  const { data: ordersData, isLoading: loading } = useGetOrdersQuery();

  const stats = statsData?.data || {};
  const orders = ordersData?.data || [];
  const organizations = stats?.organizations || [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  const orderColumns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'orange',
          processing: 'blue',
          shipped: 'cyan',
          delivered: 'green',
          cancelled: 'red'
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `$${total.toFixed(2)}`
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <>
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard>
                <Statistic
                  title="Total Shops"
                  value={organizations.length}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard>
                <Statistic
                  title="Total Orders"
                  value={totalOrders}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard>
                <Statistic
                  title="Total Revenue"
                  value={totalRevenue}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#cf1322' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard>
                <Statistic
                  title="Profile Views"
                  value={0}
                  prefix={<EyeOutlined />}
                />
              </StatCard>
            </Col>
          </Row>

          <Card title="Recent Orders" loading={loading}>
            <Table
              dataSource={orders.slice(0, 5)}
              columns={orderColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </>
      )
    },
    {
      key: 'shops',
      label: 'My Shops',
      children: (
        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>
              Create New Shop
            </Button>
          </Space>

          {organizations.length > 0 ? (
            <Row gutter={[16, 16]}>
              {organizations.map((org) => (
                <Col xs={24} sm={12} lg={8} key={org.id}>
                  <Card
                    hoverable
                    cover={
                      org.banner_url ? (
                        <img alt={org.name} src={org.banner_url} style={{ height: 150, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: 150, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShopOutlined style={{ fontSize: 48, color: '#ccc' }} />
                        </div>
                      )
                    }
                  >
                    <Card.Meta
                      title={org.name}
                      description={org.description || 'No description'}
                    />
                    <Space style={{ marginTop: 16 }}>
                      <Button size="small">Manage</Button>
                      <Button size="small">View Shop</Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Text type="secondary">You don't have any shops yet. Create one to get started!</Text>
          )}
        </Card>
      )
    },
    {
      key: 'orders',
      label: 'All Orders',
      children: (
        <Card loading={loading}>
          <Table
            dataSource={orders}
            columns={orderColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Container>
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>
            Welcome back, {user.first_name || user.email}!
          </Title>
          <Text type="secondary">
            Manage your shops, products, and orders from your dashboard
          </Text>
        </div>

        <Tabs items={tabItems} />
      </Container>
    </Layout>
  );
};
