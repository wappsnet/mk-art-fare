import { useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router';
import { Card, Typography, Button, Tabs, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { useAppSelector } from '@/hooks/useRedux';
import { useGetOrganizationByIdQuery } from '@/services/apiSlice';
import { Container, Header, OutletWrapper } from './styles';

const { Title } = Typography;

export const ShopManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const orgId = Number.parseInt(id!);

  const { data: orgData, isLoading } = useGetOrganizationByIdQuery(orgId, { skip: !orgId });
  const organization = orgData?.data;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/products') || path === `/admin/shop/${id}`) return 'products';
    if (path.endsWith('/categories')) return 'categories';
    if (path.endsWith('/events')) return 'events';
    if (path.endsWith('/orders')) return 'orders';
    if (path.endsWith('/analytics')) return 'analytics';
    if (path.endsWith('/settings')) return 'settings';
    return 'products';
  };

  const handleTabChange = (key: string) => {
    if (key === 'products') {
      navigate(`/admin/shop/${id}`);
    } else {
      navigate(`/admin/shop/${id}/${key}`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Container>
          <Spin size="large" />
        </Container>
      </Layout>
    );
  }

  if (!organization) {
    return (
      <Layout>
        <Container>
          <Title level={3}>Organization not found</Title>
        </Container>
      </Layout>
    );
  }

  const tabItems = [
    {
      key: 'products',
      label: 'Products',
    },
    {
      key: 'categories',
      label: 'Categories',
    },
    {
      key: 'events',
      label: 'Events',
    },
    {
      key: 'orders',
      label: 'Orders',
    },
    {
      key: 'analytics',
      label: 'Analytics',
    },
    {
      key: 'settings',
      label: 'Settings',
    },
  ];

  return (
    <Layout>
      <Container>
        <Header>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dashboard')}
              style={{ marginBottom: 16 }}
            >
              Back to Dashboard
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Manage {organization.name}
            </Title>
          </div>
        </Header>

        <Card>
          <Tabs activeKey={getActiveTab()} onChange={handleTabChange} items={tabItems} />

          <OutletWrapper>
            <Outlet />
          </OutletWrapper>
        </Card>
      </Container>
    </Layout>
  );
};
