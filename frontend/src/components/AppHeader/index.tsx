import { Badge, Avatar, Dropdown, Button, Space, Flex, Image } from 'antd';
import type { MenuProps } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { useAppSelector } from '@/hooks/useRedux';
import { useGetCartQuery, useLogoutMutation } from '@/services/apiSlice';
import ArtFareLogo from '@/assets/base/logo.svg';
import { HeaderStyled, LogoStyled, NavMenuStyled, UserMenuTrigger } from './style.ts';

const AppHeader = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data: cartData } = useGetCartQuery();
  const [logout] = useLogoutMutation();

  const handleLogout = () => {
    logout()
      .unwrap()
      .then(() => {
        navigate('/');
      });
  };

  // Build user menu items based on role and permissions
  const userMenuItems: MenuProps['items'] = [];

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

  const menuItems: MenuProps['items'] = [
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
  ];

  return (
    <HeaderStyled>
      <Flex align="center" justify="start" wrap="nowrap" flex={1} gap={8}>
        <LogoStyled to="/">
          <Image preview={false} width={150} src={ArtFareLogo} />
        </LogoStyled>
        <NavMenuStyled mode="horizontal" theme="light" items={menuItems} />
      </Flex>

      <Flex align="center" justify="end" flex="auto" gap={8}>
        <Link to="/cart">
          <Badge count={cartData?.data?.items?.length || 0}>
            <Button
              variant="filled"
              color="primary"
              shape="circle"
              size="large"
              icon={<ShoppingCartOutlined />}
            />
          </Badge>
        </Link>

        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <UserMenuTrigger align="center">
              <Flex align="center">
                <Avatar src={user.avatar_url} icon={<UserOutlined />} />
              </Flex>
              <Flex align="center">
                <span>{user.first_name || user.email}</span>
              </Flex>
            </UserMenuTrigger>
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
      </Flex>
    </HeaderStyled>
  );
};

export default AppHeader;
