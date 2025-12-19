import { useParams, useNavigate, Outlet, useLocation } from 'react-router';
import { Card, Typography, Button, Tabs, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { useGetOrganizationByIdQuery } from '@/services/apiSlice';
import { ContainerStyled, HeaderStyled, OutletWrapperStyled } from './styles';
import { useMemo } from 'react';

const { Title } = Typography;

const ShopManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = Number.parseInt(id!);

  const { data: orgData, isLoading } = useGetOrganizationByIdQuery(orgId, { skip: !orgId });
  const organization = orgData?.data;

  const handleTabChange = (path: string) => {
    navigate(path);
  };

  const tabItems = useMemo(
    () => [
      {
        key: `/dashboard/shop/${id}/products`,
        label: 'Products',
      },
      {
        key: `/dashboard/shop/${id}/categories`,
        label: 'Categories',
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
        key: `/dashboard/shop/${id}/custom-fields`,
        label: 'Custom Fields',
      },
      {
        key: `/dashboard/shop/${id}/settings`,
        label: 'Settings',
      },
    ],
    [id]
  );

  if (isLoading) {
    return (
      <Layout>
        <ContainerStyled>
          <Spin size="large" />
        </ContainerStyled>
      </Layout>
    );
  }

  if (organization === null || organization === undefined) {
    return (
      <Layout>
        <ContainerStyled>
          <Title level={3}>Organization not found</Title>
        </ContainerStyled>
      </Layout>
    );
  }

  return (
    <Layout>
      <ContainerStyled>
        <HeaderStyled>
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
        </HeaderStyled>

        <Card>
          <Tabs
            defaultActiveKey={tabItems[0].key}
            activeKey={location.pathname}
            onChange={handleTabChange}
            items={tabItems}
          />

          <OutletWrapperStyled>
            <Outlet />
          </OutletWrapperStyled>
        </Card>
      </ContainerStyled>
    </Layout>
  );
};

export default ShopManagementPage;
