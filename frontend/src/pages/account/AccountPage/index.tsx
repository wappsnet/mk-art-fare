import { SyntheticEvent } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StarIcon from '@mui/icons-material/Star';
import { Card, Typography, Tabs, Tab } from '@mui/material';
import { useNavigate, Outlet, useLocation } from 'react-router';

import AppLayout from '@/components/AppLayout';

import { ContainerStyled, HeaderStyled, OutletContainer } from './styles';

const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const tabItems = [
    {
      key: '/account',
      label: 'Profile',
      icon: <PersonIcon />,
    },
    {
      key: '/account/password',
      label: 'Change Password',
      icon: <LockIcon />,
    },
    {
      key: '/account/orders',
      label: 'My Orders',
      icon: <ShoppingBagIcon />,
    },
    {
      key: '/account/subscription',
      label: 'Subscription',
      icon: <StarIcon />,
    },
  ];

  return (
    <AppLayout>
      <ContainerStyled>
        <HeaderStyled>
          <Typography variant="h4">Account Settings</Typography>
        </HeaderStyled>

        <Card>
          <Tabs
            value={location.pathname}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabItems.map((item) => (
              <Tab
                key={item.key}
                value={item.key}
                label={item.label}
                icon={item.icon}
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
            ))}
          </Tabs>
          <OutletContainer>
            <Outlet />
          </OutletContainer>
        </Card>
      </ContainerStyled>
    </AppLayout>
  );
};

export default AccountPage;
