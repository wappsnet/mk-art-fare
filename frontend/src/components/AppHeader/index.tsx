import { FC, useState, MouseEvent } from 'react';

import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  AppBar,
  Toolbar,
  Badge,
  Avatar,
  Button,
  Stack,
  Box,
  Menu,
  MenuItem,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  ListItemButton,
} from '@mui/material';
import { Link, useNavigate } from 'react-router';

import ArtFareLogo from '@/assets/base/logo.svg';
import AppDrawer from '@/components/AppDrawer';
import { useAppSelector } from '@/hooks/useRedux';
import { useGetCartQuery, useLogoutMutation } from '@/services/apiSlice';

const AppHeader: FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data: cartData } = useGetCartQuery();
  const [logout] = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout()
      .unwrap()
      .then(() => {
        navigate('/');
      });
    setUserMenuAnchor(null);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleUserMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar component={Container} maxWidth="lg">
        <Box component={Link} to="/" sx={{ display: 'flex', mr: 2 }}>
          <img width={150} src={ArtFareLogo} alt="ArtFare" />
        </Box>

        {/* Desktop Menu */}
        <Stack direction="row" spacing={1} sx={{ flex: 1, display: { xs: 'none', md: 'flex' } }}>
          <Button component={Link} to="/">
            Home
          </Button>
          <Button component={Link} to="/products">
            Products
          </Button>
          <Button component={Link} to="/blog">
            Blog
          </Button>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
        >
          {/* Cart - visible on all screen sizes */}
          <IconButton component={Link} to="/cart" color="primary">
            <Badge badgeContent={cartData?.data?.items?.length || 0} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* Desktop User Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 1 }}>
            {user ? (
              <>
                <Button
                  onClick={handleUserMenuOpen}
                  startIcon={
                    <Avatar src={user.avatar_url} sx={{ width: 32, height: 32 }}>
                      <PersonIcon />
                    </Avatar>
                  }
                >
                  {user.first_name || user.email}
                </Button>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                >
                  {(user.role === 'artist' ||
                    user.role === 'admin' ||
                    user.role === 'customer') && (
                    <MenuItem component={Link} to="/dashboard" onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <StorefrontIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Dashboard</ListItemText>
                    </MenuItem>
                  )}
                  <MenuItem component={Link} to="/account" onClick={handleUserMenuClose}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Account</ListItemText>
                  </MenuItem>
                  {user.role === 'admin' && (
                    <MenuItem component={Link} to="/admin" onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Admin</ListItemText>
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button component={Link} to="/login" startIcon={<LoginIcon />}>
                  Login
                </Button>
                <Button component={Link} to="/register" variant="contained">
                  Sign Up
                </Button>
              </Stack>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
        </Stack>

        {/* Mobile Drawer Menu */}
        <AppDrawer open={mobileMenuOpen} onClose={closeMobileMenu} title="Menu" width={280}>
          {user ? (
            <List>
              {(user.role === 'artist' || user.role === 'admin' || user.role === 'customer') && (
                <ListItemButton component={Link} to="/dashboard" onClick={closeMobileMenu}>
                  <ListItemIcon>
                    <StorefrontIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              )}
              <ListItemButton component={Link} to="/account" onClick={closeMobileMenu}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Account" />
              </ListItemButton>
              {user.role === 'admin' && (
                <ListItemButton component={Link} to="/admin" onClick={closeMobileMenu}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Admin" />
                </ListItemButton>
              )}
              <ListItemButton
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
              >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </List>
          ) : (
            <List>
              <ListItemButton component={Link} to="/login" onClick={closeMobileMenu}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
              <ListItemButton component={Link} to="/register" onClick={closeMobileMenu}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </List>
          )}
          <Divider />
          <List>
            <ListItemButton component={Link} to="/" onClick={closeMobileMenu}>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={Link} to="/products" onClick={closeMobileMenu}>
              <ListItemText primary="Products" />
            </ListItemButton>
            <ListItemButton component={Link} to="/blog" onClick={closeMobileMenu}>
              <ListItemText primary="Blog" />
            </ListItemButton>
          </List>
        </AppDrawer>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
