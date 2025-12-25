import { useMemo } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Card, Typography, Button, Tabs, Spin, Space } from 'antd';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router';

import AppLayout from '@/components/AppLayout';
import { useGetOrganizationByIdQuery } from '@/services/apiSlice';

import { ContainerStyled, HeaderStyled, OutletWrapperStyled } from './styles';

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
        key: `/dashboard/shop/${id}`,
        label: 'Settings',
      },
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
    ],
    [id]
  );

  if (isLoading) {
    return (
      <AppLayout>
        <ContainerStyled>
          <Spin size="large" />
        </ContainerStyled>
      </AppLayout>
    );
  }

  if (organization === null || organization === undefined) {
    return (
      <AppLayout>
        <ContainerStyled>
          <Title level={3}>Organization not found</Title>
        </ContainerStyled>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ContainerStyled>
        <HeaderStyled>
          <Space direction="vertical" size="small">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dashboard')}
              css={{ marginBottom: 16 }}
            >
              Back to Dashboard
            </Button>
            <Title level={2} css={{ margin: 0 }}>
              Manage {organization.name}
            </Title>
          </Space>
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
    </AppLayout>
  );
};

export default ShopManagementPage;
