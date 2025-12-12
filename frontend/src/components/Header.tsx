import { Layout as AntLayout, Menu, Badge, Avatar, Dropdown, Button, Space } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import styled from '@emotion/styled';
import { useAppSelector } from '@/hooks/useRedux';
import { useGetCartQuery, useLogoutMutation } from '@/services/apiSlice';

const { Header: AntHeader } = AntLayout;

const StyledHeader = styled(AntHeader)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 50px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  text-decoration: none;

  &:hover {
    color: #40a9ff;
  }
`;

const NavMenu = styled(Menu)`
  flex: 1;
  border: none;
  margin-left: 50px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { data: cartData } = useGetCartQuery();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Build user menu items based on role and permissions
  const userMenuItems = [];

  // Show Dashboard for artists, admins, or users who can create organizations
  if (
    user?.role === 'artist' ||
    user?.role === 'admin' ||
    user?.role === 'customer' // Customers can also create organizations
  ) {
    userMenuItems.push({
      key: 'dashboard',
      icon: <ShopOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    });
  }

  // Account is available to all authenticated users
  userMenuItems.push({
    key: 'account',
    icon: <UserOutlined />,
    label: <Link to="/account">Account</Link>,
  });

  // Admin menu only for admins
  if (user?.role === 'admin') {
    userMenuItems.push({
      key: 'admin',
      icon: <UserOutlined />,
      label: <Link to="/admin">Admin</Link>,
    });
  }

  // Logout for everyone
  userMenuItems.push({
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    onClick: handleLogout,
  });

  const menuItems = [
    {
      key: 'home',
      label: <Link to="/">Home</Link>,
    },
    {
      key: 'products',
      label: <Link to="/products">Products</Link>,
    },
    {
      key: 'blog',
      label: <Link to="/blog">Blog</Link>,
    },
    {
      key: 'events',
      label: <Link to="/events">Events</Link>,
    },
  ];

  return (
    <StyledHeader>
      <Logo to="/">Art Fare</Logo>

      <NavMenu mode="horizontal" items={menuItems} />

      <Space size="large">
        <Link to="/cart">
          <Badge count={cartData?.data?.items?.length || 0}>
            <ShoppingCartOutlined style={{ fontSize: '24px', color: '#000' }} />
          </Badge>
        </Link>

        {isAuthenticated && user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={user.avatar_url} icon={<UserOutlined />} />
              <span>{user.first_name || user.email}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Link to="/login">
              <Button type="text" icon={<LoginOutlined />}>
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button type="primary">Sign Up</Button>
            </Link>
          </Space>
        )}
      </Space>
    </StyledHeader>
  );
};
