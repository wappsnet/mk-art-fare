import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, Space, Tabs, message, Modal, Form, Select, Input } from 'antd';
import { UserOutlined, ShopOutlined, ShoppingOutlined, DollarOutlined, TeamOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { Layout } from '../components/Layout';
import { useAppSelector } from '../hooks/useRedux';
import { apiService } from '../services/api';
import { ApiResponse } from '../types';

const { Title, Text } = Typography;

const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

const StatCard = styled(Card)`
  .ant-statistic-title {
    color: #666;
  }
`;

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Organization {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  owner_first_name: string;
  created_at: string;
}

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  view_count: number;
  created_at: string;
}

interface Event {
  id: number;
  title: string;
  slug: string;
  event_type: string;
  start_date: string;
  created_at: string;
}

interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalBlogPosts: number;
  totalEvents: number;
}

export const AdminPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBlogPosts: 0,
    totalEvents: 0
  });
  const [editUserModal, setEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      message.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchAdminData();
  }, [isAuthenticated, user, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersResponse = await apiService.get<ApiResponse<User[]>>('/users');
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      // Fetch organizations
      const orgsResponse = await apiService.get<ApiResponse<Organization[]>>('/organizations');
      if (orgsResponse.success && orgsResponse.data) {
        setOrganizations(orgsResponse.data);
      }

      // Fetch blog posts
      const blogResponse = await apiService.get<ApiResponse<{ posts: BlogPost[] }>>('/blog');
      if (blogResponse.success && blogResponse.data) {
        setBlogPosts(blogResponse.data.posts);
      }

      // Fetch events
      const eventsResponse = await apiService.get<ApiResponse<Event[]>>('/events');
      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }

      // Calculate stats
      setStats({
        totalUsers: usersResponse.data?.length || 0,
        totalOrganizations: orgsResponse.data?.length || 0,
        totalProducts: 0, // Would need a separate API call
        totalOrders: 0,
        totalRevenue: 0,
        totalBlogPosts: blogResponse.data?.posts?.length || 0,
        totalEvents: eventsResponse.data?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      message.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      role: user.role,
      is_active: user.is_active ? 'active' : 'inactive'
    });
    setEditUserModal(true);
  };

  const handleUpdateUser = async (values: any) => {
    if (!selectedUser) return;

    try {
      await apiService.patch(`/users/${selectedUser.id}`, {
        role: values.role,
        is_active: values.is_active === 'active'
      });

      message.success('User updated successfully');
      setEditUserModal(false);
      form.resetFields();
      fetchAdminData();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Name',
      key: 'name',
      render: (record: User) => (
        <div>
          <Text strong>{record.first_name} {record.last_name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          admin: 'red',
          artist: 'blue',
          customer: 'green'
        };
        return <Tag color={colorMap[role]}>{role.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Button size="small" onClick={() => handleEditUser(record)}>
            Edit
          </Button>
        </Space>
      )
    }
  ];

  const organizationColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Shop Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Organization) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>/{record.slug}</Text>
        </div>
      )
    },
    {
      title: 'Owner',
      dataIndex: 'owner_first_name',
      key: 'owner_first_name'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Organization) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/shop/${record.slug}`)}>
            View
          </Button>
        </Space>
      )
    }
  ];

  const blogColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: BlogPost) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>/{record.slug}</Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'success' : 'warning'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Views',
      dataIndex: 'view_count',
      key: 'view_count'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: BlogPost) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/blog/${record.slug}`)}>
            View
          </Button>
        </Space>
      )
    }
  ];

  const eventColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Event) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>/{record.slug}</Text>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type: string) => <Tag>{type}</Tag>
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Event) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/events/${record.slug}`)}>
            View
          </Button>
        </Space>
      )
    }
  ];

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <StatCard>
                <Statistic
                  title="Total Users"
                  value={stats.totalUsers}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard>
                <Statistic
                  title="Total Shops"
                  value={stats.totalOrganizations}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard>
                <Statistic
                  title="Total Orders"
                  value={stats.totalOrders}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard>
                <Statistic
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#faad14' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard>
                <Statistic
                  title="Blog Posts"
                  value={stats.totalBlogPosts}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard>
                <Statistic
                  title="Events"
                  value={stats.totalEvents}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </StatCard>
            </Col>
          </Row>
        </>
      )
    },
    {
      key: 'users',
      label: `Users (${users.length})`,
      children: (
        <Card>
          <Table
            dataSource={users}
            columns={userColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'organizations',
      label: `Shops (${organizations.length})`,
      children: (
        <Card>
          <Table
            dataSource={organizations}
            columns={organizationColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'blog',
      label: `Blog Posts (${blogPosts.length})`,
      children: (
        <Card>
          <Table
            dataSource={blogPosts}
            columns={blogColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'events',
      label: `Events (${events.length})`,
      children: (
        <Card>
          <Table
            dataSource={events}
            columns={eventColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    }
  ];

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <Container>
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>
            <UserOutlined /> Admin Dashboard
          </Title>
          <Text type="secondary">
            Platform management and analytics
          </Text>
        </div>

        <Tabs items={tabItems} />

        {/* Edit User Modal */}
        <Modal
          title="Edit User"
          open={editUserModal}
          onCancel={() => {
            setEditUserModal(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateUser}
          >
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select>
                <Select.Option value="customer">Customer</Select.Option>
                <Select.Option value="artist">Artist</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Status"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Update User
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Container>
    </Layout>
  );
};
