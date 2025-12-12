import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Tabs,
  message,
  Modal,
  Form,
  Select,
} from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Layout } from '@/components/Layout';
import { useAppSelector } from '@/hooks/useRedux';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useGetOrganizationsQuery,
  useGetBlogPostsQuery,
  useGetEventsQuery,
} from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { Organization, UserRole } from '@/types';
import { Container, StatCard, Header } from './styles';

const { Title, Text } = Typography;

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
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
  const [editUserModal, setEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: orgsData, isLoading: orgsLoading } = useGetOrganizationsQuery();
  const { data: blogData, isLoading: blogLoading } = useGetBlogPostsQuery({});
  const { data: eventsData, isLoading: eventsLoading } = useGetEventsQuery({});
  const [updateUser] = useUpdateUserMutation();

  const users = usersData?.data || [];
  const organizations = orgsData?.data || [];
  const blogPosts = blogData?.data?.posts || [];
  const events = eventsData?.data || [];
  const loading = usersLoading || orgsLoading || blogLoading || eventsLoading;

  const stats: PlatformStats = {
    totalUsers: users.length,
    totalOrganizations: organizations.length,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBlogPosts: blogPosts.length,
    totalEvents: events.length,
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      message.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      role: user.role,
      is_active: user.is_active ? 'active' : 'inactive',
    });
    setEditUserModal(true);
  };

  const handleUpdateUser = async (values: User) => {
    if (!selectedUser) return;

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
      form.resetFields();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update user');
    }
  };

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      key: 'name',
      render: (record: User) => (
        <div>
          <Text strong>
            {record.first_name} {record.last_name}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          admin: 'red',
          artist: 'blue',
          customer: 'green',
        };
        return <Tag color={colorMap[role]}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
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
      ),
    },
  ];

  const organizationColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Shop Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Organization) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            /{record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
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
      ),
    },
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            /{record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'success' : 'warning'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Views',
      dataIndex: 'view_count',
      key: 'view_count',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
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
      ),
    },
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            /{record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type: string, record: Event) => <Tag>{type ?? record.event_type}</Tag>,
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
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
      ),
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
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
      ),
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
      ),
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
      ),
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
      ),
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
      ),
    },
  ];

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title level={2}>
            <UserOutlined /> Admin Dashboard
          </Title>
          <Text type="secondary">Platform management and analytics</Text>
        </Header>

        <Tabs items={tabItems} />

        <Modal
          title="Edit User"
          open={editUserModal}
          onCancel={() => {
            setEditUserModal(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleUpdateUser}>
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
