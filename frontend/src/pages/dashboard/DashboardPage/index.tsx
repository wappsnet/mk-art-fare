import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Row, Col, Card, Typography, Button, Modal, Form, Input, message } from 'antd';
import { ShopOutlined, PlusOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { useAppSelector } from '@/hooks/useRedux';
import { useGetMyOrganizationsQuery, useCreateOrganizationMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import {
  ContainerStyled,
  WelcomeSectionStyled,
  CreateShopSpaceStyled,
  ShopCardCoverStyled,
  PlaceholderCoverStyled,
  PlaceholderIconStyled,
  ShopCardActionsStyled,
} from './styles';

const { Title, Text } = Typography;

interface CreateShopFormValues {
  name: string;
  slug: string;
  description?: string;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: organizationsData, refetch } = useGetMyOrganizationsQuery();
  const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation();

  const organizations = organizationsData?.data || [];

  const handleCreateShop = async (values: CreateShopFormValues) => {
    try {
      await createOrganization(values).unwrap();
      message.success('Shop created successfully!');
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to create shop');
    }
  };

  return (
    <Layout>
      <ContainerStyled>
        <WelcomeSectionStyled>
          <Title level={2}>Welcome back, {user?.first_name || user?.email}!</Title>
          <Text type="secondary">Manage your shops and products from your dashboard</Text>
        </WelcomeSectionStyled>

        <Card>
          <CreateShopSpaceStyled>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Create New Shop
            </Button>
          </CreateShopSpaceStyled>

          {organizations.length > 0 ? (
            <Row gutter={[16, 16]}>
              {organizations.map((org) => (
                <Col xs={24} sm={12} lg={8} key={org.id}>
                  <Card
                    hoverable
                    cover={
                      org.banner_url ? (
                        <ShopCardCoverStyled alt={org.name} src={org.banner_url} />
                      ) : (
                        <PlaceholderCoverStyled>
                          <PlaceholderIconStyled>
                            <ShopOutlined />
                          </PlaceholderIconStyled>
                        </PlaceholderCoverStyled>
                      )
                    }
                  >
                    <Card.Meta title={org.name} description={org.description || 'No description'} />
                    <ShopCardActionsStyled>
                      <Button size="small" onClick={() => navigate(`/dashboard/shop/${org.id}`)}>
                        Manage
                      </Button>
                      <Button size="small" onClick={() => navigate(`/shop/${org.slug}`)}>
                        View Shop
                      </Button>
                    </ShopCardActionsStyled>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Text type="secondary">You don't have any shops yet. Create one to get started!</Text>
          )}
        </Card>
      </ContainerStyled>

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
            <ShopCardActionsStyled>
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
            </ShopCardActionsStyled>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};
