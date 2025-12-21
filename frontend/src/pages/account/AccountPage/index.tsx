import { useNavigate, Outlet, useLocation } from 'react-router';
import { Card, Typography, Tabs } from 'antd';
import { UserOutlined, LockOutlined, ShoppingOutlined, CrownOutlined } from '@ant-design/icons';
import AppLayout from '@/components/AppLayout';
import { ContainerStyled, HeaderStyled, OutletContainer } from './styles';

const { Title } = Typography;

const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  const tabItems = [
    {
      key: '/account',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      key: '/account/password',
      label: 'Change Password',
      icon: <LockOutlined />,
    },
    {
      key: '/account/orders',
      label: 'My Orders',
      icon: <ShoppingOutlined />,
    },
    {
      key: '/account/subscription',
      label: 'Subscription',
      icon: <CrownOutlined />,
    },
  ];

  return (
    <AppLayout>
      <ContainerStyled>
        <HeaderStyled>
          <Title level={2}>Account Settings</Title>
        </HeaderStyled>

        <Card>
          <Tabs
            defaultActiveKey={tabItems[0].key}
            activeKey={location.pathname}
            onChange={handleTabChange}
            items={tabItems}
          />
          <OutletContainer>
            <Outlet />
          </OutletContainer>
        </Card>
      </ContainerStyled>
    </AppLayout>
  );
};

export default AccountPage;
