import { FC, useState, ReactNode } from 'react';

import ArticleIcon from '@mui/icons-material/Article';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useGetOrganizationsQuery,
  useGetBlogPostsQuery,
} from '@/services/apiSlice';
import { UserRole } from '@/types/common';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalBlogPosts: number;
}

interface UserUpdateValues {
  role: UserRole;
  is_active: boolean;
}

const AdminPage: FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editUserModal, setEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { control, handleSubmit, reset } = useForm<UserUpdateValues>();

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: orgsData, isLoading: orgsLoading } = useGetOrganizationsQuery();
  const { data: blogData, isLoading: blogLoading } = useGetBlogPostsQuery({});
  const [updateUser] = useUpdateUserMutation();

  const users = usersData?.data || [];
  const organizations = orgsData?.data || [];
  const blogPosts = blogData?.data?.posts || [];
  const loading = usersLoading || orgsLoading || blogLoading;

  const stats: PlatformStats = {
    totalUsers: users.length,
    totalOrganizations: organizations.length,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBlogPosts: blogPosts.length,
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    reset({
      role: user.role,
      is_active: user.is_active,
    });
    setEditUserModal(true);
  };

  const handleUpdateUser = async (values: UserUpdateValues) => {
    if (selectedUser) {
      try {
        await updateUser({
          id: selectedUser.id,
          data: {
            role: values.role,
            is_active: values.is_active,
          },
        }).unwrap();

        message.success('User updated successfully');
        setEditUserModal(false);
        reset();
      } catch (error) {
        message.error(getErrorMessage(error) || 'Failed to update user');
      }
    }
  };

  const getRoleColor = (role: string): 'error' | 'primary' | 'success' => {
    const colorMap: Record<string, 'error' | 'primary' | 'success'> = {
      admin: 'error',
      artist: 'primary',
      customer: 'success',
    };
    return colorMap[role] || 'default';
  };

  return (
    <AppLayout>
      <Box sx={{ py: 4, px: 3 }}>
        <Stack spacing={4}>
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PersonIcon /> Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Platform management and analytics
            </Typography>
          </Box>

          <Tabs
            variant="scrollable"
            scrollButtons="auto"
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
          >
            <Tab label="Overview" />
            <Tab label={`Users (${users.length})`} />
            <Tab label={`Shops (${organizations.length})`} />
            <Tab label={`Blog Posts (${blogPosts.length})`} />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <GroupIcon sx={{ fontSize: 40, color: 'success.main' }} />
                      <Box>
                        <Typography variant="h4">{stats.totalUsers}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Users
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <StorefrontIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h4">{stats.totalOrganizations}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Shops
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <ShoppingBagIcon sx={{ fontSize: 40, color: 'error.main' }} />
                      <Box>
                        <Typography variant="h4">{stats.totalOrders}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Orders
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <AttachMoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                      <Box>
                        <Typography variant="h4">${stats.totalRevenue.toFixed(2)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Revenue
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <ArticleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                      <Box>
                        <Typography variant="h4">{stats.totalBlogPosts}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Blog Posts
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate('/admin/organizations')}
                  >
                    <CardContent>
                      <Stack spacing={1} alignItems="center">
                        <StorefrontIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Typography variant="h6">Shop Moderation</Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          Approve or decline shops
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate('/admin/products')}
                  >
                    <CardContent>
                      <Stack spacing={1} alignItems="center">
                        <ShoppingBagIcon sx={{ fontSize: 40, color: 'error.main' }} />
                        <Typography variant="h6">Product Moderation</Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          Review product listings
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate('/admin/orders')}
                  >
                    <CardContent>
                      <Stack spacing={1} alignItems="center">
                        <AttachMoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                        <Typography variant="h6">All Orders</Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          View platform orders
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate('/admin/pages')}
                  >
                    <CardContent>
                      <Stack spacing={1} alignItems="center">
                        <DescriptionIcon sx={{ fontSize: 40, color: 'info.main' }} />
                        <Typography variant="h6">Page Management</Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          Edit static page content
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            ID
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Name
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Role
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Status
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Joined
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Actions
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography>Loading...</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id} hover>
                            <TableCell>
                              <Typography variant="body2">{user.id}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {user.first_name} {user.last_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {user.email}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.role.toUpperCase()}
                                color={getRoleColor(user.role)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.is_active ? 'Active' : 'Inactive'}
                                color={user.is_active ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {dayjs(user.created_at).format('MMM DD, YYYY')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button size="small" onClick={() => handleEditUser(user)}>
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            ID
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Shop Name
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Created
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Actions
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography>Loading...</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        organizations.map((org) => (
                          <TableRow key={org.id} hover>
                            <TableCell>
                              <Typography variant="body2">{org.id}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {org.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  /{org.slug}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {dayjs(org.created_at).format('MMM DD, YYYY')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button size="small" onClick={() => navigate(`/shop/${org.slug}`)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Title
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Status
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Views
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Created
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Actions
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography>Loading...</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        blogPosts.map((post) => (
                          <TableRow key={post.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {post.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  /{post.slug}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={post.status.toUpperCase()}
                                color={post.status === 'published' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{post.view_count}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {dayjs(post.created_at).format('MMM DD, YYYY')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button size="small" onClick={() => navigate(`/blog/${post.slug}`)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>

          <Dialog
            open={editUserModal}
            onClose={() => {
              setEditUserModal(false);
              reset();
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Edit User</DialogTitle>
            <form onSubmit={handleSubmit(handleUpdateUser)}>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: 'Please select a role' }}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>Role</InputLabel>
                        <Select {...field} label="Role">
                          <MenuItem value="customer">Customer</MenuItem>
                          <MenuItem value="artist">Artist</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />

                  <Controller
                    name="is_active"
                    control={control}
                    rules={{ required: 'Please select a status' }}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          {...field}
                          value={field.value ? 'active' : 'inactive'}
                          onChange={(e) => field.onChange(e.target.value === 'active')}
                          label="Status"
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setEditUserModal(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained">
                  Update User
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Stack>
      </Box>
    </AppLayout>
  );
};

export default AdminPage;
