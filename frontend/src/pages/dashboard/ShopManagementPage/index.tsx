import { useParams, useNavigate, Outlet, useLocation } from 'react-router';
import { Card, Typography, Button, Tabs, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { useGetOrganizationByIdQuery } from '@/services/apiSlice';
import { Container, Header, OutletWrapper } from './styles';

const { Title } = Typography;

export const ShopManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = Number.parseInt(id!);

  const { data: orgData, isLoading } = useGetOrganizationByIdQuery(orgId, { skip: !orgId });
  const organization = orgData?.data;

  const handleTabChange = (key: string) => {
    if (key === 'products') {
      navigate(`/dashboard/shop/${id}`);
    } else {
      navigate(`/dashboard/shop/${id}/${key}`);
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
      key: `/dashboard/shop/${id}/products`,
      label: 'Products',
    },
    {
      key: `/dashboard/shop/${id}/categories`,
      label: 'Categories',
    },
    {
      key: `/dashboard/shop/${id}/events`,
      label: 'Events',
    },
    {
      key: `/dashboard/shop/${id}/orders`,
      label: 'Orders',
    },
    {
      key: `/dashboard/shop/${id}/analytics`,
      label: 'Analytics',
    },
    {
      key: `/dashboard/shop/${id}/settings`,
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
          <Tabs activeKey={location.pathname} onChange={handleTabChange} items={tabItems} />

          <OutletWrapper>
            <Outlet />
          </OutletWrapper>
        </Card>
      </Container>
    </Layout>
  );
};
