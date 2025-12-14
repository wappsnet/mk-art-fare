import { useNavigate, Outlet, useLocation } from 'react-router';
import { Card, Typography, Tabs } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CalendarOutlined,
  TagOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { Container, Header } from './styles';

const { Title } = Typography;

export const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  const tabItems = [
    {
      key: '/account/profile',
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
      key: '/account/events',
      label: 'My Events',
      icon: <CalendarOutlined />,
    },
    {
      key: '/account/tickets',
      label: 'My Tickets',
      icon: <TagOutlined />,
    },
  ];

  return (
    <Layout>
      <Container>
        <Header>
          <Title level={2}>Account Settings</Title>
        </Header>

        <Card>
          <Tabs activeKey={location.pathname} onChange={handleTabChange} items={tabItems} />
          <div style={{ marginTop: '24px' }}>
            <Outlet />
          </div>
        </Card>
      </Container>
    </Layout>
  );
};
