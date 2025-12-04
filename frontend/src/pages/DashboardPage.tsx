import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Space, Modal, Form, Input, message } from 'antd';
import { ShopOutlined, PlusOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { Layout } from '../components/Layout';
import { useAppSelector } from '../hooks/useRedux';
import { useGetMyOrganizationsQuery, useCreateOrganizationMutation } from '@/services/apiSlice';

const { Title, Text } = Typography;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: organizationsData, refetch } = useGetMyOrganizationsQuery();
  const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation();

  const organizations = organizationsData?.data || [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleCreateShop = async (values: any) => {
    try {
      await createOrganization(values).unwrap();
      message.success('Shop created successfully!');
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to create shop');
    }
  };

  return user ? (
    <Layout>
      <Container>
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>Welcome back, {user.first_name || user.email}!</Title>
          <Text type="secondary">Manage your shops and products from your dashboard</Text>
        </div>

        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Create New Shop
            </Button>
          </Space>

          {organizations.length > 0 ? (
            <Row gutter={[16, 16]}>
              {organizations.map((org) => (
                <Col xs={24} sm={12} lg={8} key={org.id}>
                  <Card
                    hoverable
                    cover={
                      org.banner_url ? (
                        <img
                          alt={org.name}
                          src={org.banner_url}
                          style={{ height: 150, objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 150,
                            background: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ShopOutlined style={{ fontSize: 48, color: '#ccc' }} />
                        </div>
                      )
                    }
                  >
                    <Card.Meta title={org.name} description={org.description || 'No description'} />
                    <Space style={{ marginTop: 16 }}>
                      <Button size="small" onClick={() => navigate(`/admin/shop/${org.id}`)}>
                        Manage
                      </Button>
                      <Button size="small" onClick={() => navigate(`/shop/${org.slug}`)}>
                        View Shop
                      </Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Text type="secondary">You don't have any shops yet. Create one to get started!</Text>
          )}
        </Card>
      </Container>

      <Modal
        title="Create New Shop"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateShop}>
          <Form.Item
            name="name"
            label="Shop Name"
            rules={[{ required: true, message: 'Please enter shop name' }]}
          >
            <Input placeholder="e.g., My Art Studio" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Shop URL"
            rules={[
              { required: true, message: 'Please enter shop URL' },
              { pattern: /^[a-z0-9-]+$/, message: 'Only lowercase letters, numbers, and hyphens' },
            ]}
          >
            <Input placeholder="e.g., my-art-studio" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Tell customers about your shop..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create Shop
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  ) : null;
};
