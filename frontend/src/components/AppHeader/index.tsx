import { useState } from 'react';

import {
  ShoppingCartOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  ShopOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Badge, Avatar, Dropdown, Button, Space, Flex, Image, Drawer } from 'antd';
import { Link, useNavigate } from 'react-router';

import ArtFareLogo from '@/assets/base/logo.svg';
import { useAppSelector } from '@/hooks/useRedux';
import { useGetCartQuery, useLogoutMutation } from '@/services/apiSlice';

import {
  HeaderStyled,
  LogoStyled,
  NavMenuStyled,
  UserMenuTriggerStyled,
  MobileMenuButtonStyled,
  MobileMenuStyled,
  DesktopMenuContainerStyled,
} from './style.ts';

import type { MenuProps } from 'antd';

const AppHeader = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data: cartData } = useGetCartQuery();
  const [logout] = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout()
      .unwrap()
      .then(() => {
        navigate('/');
      });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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

  // Mobile menu items (combines main nav + user menu)
  const mobileMenuItems: MenuProps['items'] = [
    ...menuItems,
    { type: 'divider' },
    ...(user
      ? userMenuItems
      : [
          {
            key: 'login',
            icon: <LoginOutlined />,
            label: <Link to="/login">Login</Link>,
            onClick: closeMobileMenu,
          },
          {
            key: 'register',
            icon: <UserOutlined />,
            label: <Link to="/register">Sign Up</Link>,
            onClick: closeMobileMenu,
          },
        ]),
  ];

  return (
    <HeaderStyled>
      <Flex align="center" justify="start" wrap="nowrap" flex={1} gap={8}>
        <LogoStyled to="/">
          <Image preview={false} width={150} src={ArtFareLogo} />
        </LogoStyled>

        {/* Desktop Menu */}
        <DesktopMenuContainerStyled>
          <NavMenuStyled mode="horizontal" theme="light" items={menuItems} />
        </DesktopMenuContainerStyled>
      </Flex>

      <Flex align="center" justify="end" flex="auto" gap={8}>
        {/* Cart - visible on all screen sizes */}
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

        {/* Desktop User Menu */}
        <DesktopMenuContainerStyled>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <UserMenuTriggerStyled align="center">
                <Flex align="center">
                  <Avatar src={user.avatar_url} icon={<UserOutlined />} />
                </Flex>
                <Flex align="center">
                  <span>{user.first_name || user.email}</span>
                </Flex>
              </UserMenuTriggerStyled>
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
        </DesktopMenuContainerStyled>

        {/* Mobile Menu Button */}
        <MobileMenuButtonStyled
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuOpen(true)}
          size="large"
        />
      </Flex>

      {/* Mobile Drawer Menu */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={closeMobileMenu}
        open={mobileMenuOpen}
        width={280}
      >
        <MobileMenuStyled
          mode="inline"
          items={mobileMenuItems}
          onClick={closeMobileMenu}
        />
      </Drawer>
    </HeaderStyled>
  );
};

export default AppHeader;
