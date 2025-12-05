import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Modal, Form, Input, message, Upload, ColorPicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
  useUpdateOrganizationThemeMutation,
  useUploadOrganizationLogoMutation,
  useUploadOrganizationBannerMutation,
} from '@/services/apiSlice';

const { Title, Text } = Typography;

export const ShopSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orgId = parseInt(id!);

  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [shopForm] = Form.useForm();
  const [brandingForm] = Form.useForm();

  const { data: orgData } = useGetOrganizationByIdQuery(orgId, { skip: !orgId });
  const [updateOrganization, { isLoading: isUpdatingOrg }] = useUpdateOrganizationMutation();
  const [updateTheme, { isLoading: isUpdatingTheme }] = useUpdateOrganizationThemeMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadOrganizationLogoMutation();
  const [uploadBanner, { isLoading: isUploadingBanner }] = useUploadOrganizationBannerMutation();

  const organization = orgData?.data;

  const handleShopUpdate = async (values: any) => {
    try {
      await updateOrganization({ id: orgId, ...values }).unwrap();
      message.success('Shop updated successfully!');
      setIsShopModalOpen(false);
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update shop');
    }
  };

  const handleBrandingUpdate = async (values: any) => {
    try {
      const formData: any = {
        organizationId: orgId,
        primaryColor: values.primaryColor?.toHexString?.() || values.primaryColor,
        secondaryColor: values.secondaryColor?.toHexString?.() || values.secondaryColor,
      };

      await updateTheme(formData).unwrap();

      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        await uploadLogo({ organizationId: orgId, formData: logoFormData }).unwrap();
      }

      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append('banner', bannerFile);
        await uploadBanner({ organizationId: orgId, formData: bannerFormData }).unwrap();
      }

      message.success('Branding updated successfully!');
      setIsBrandingModalOpen(false);
      setLogoFile(null);
      setBannerFile(null);
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update branding');
    }
  };

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>Basic Information</Title>
            <Button type="primary" onClick={() => setIsShopModalOpen(true)}>
              Edit Shop Details
            </Button>
          </div>

          <div>
            <Title level={4}>Shop Information</Title>
            <Space direction="vertical">
              <Text>
                <strong>Name:</strong> {organization.name}
              </Text>
              <Text>
                <strong>URL:</strong> artfare.com/{organization.slug}
              </Text>
              <Text>
                <strong>Description:</strong> {organization.description || 'No description'}
              </Text>
            </Space>
          </div>

          <div>
            <Title level={4}>Branding & Theme</Title>
            <Button type="primary" onClick={() => setIsBrandingModalOpen(true)}>
              Update Branding
            </Button>
          </div>
        </Space>
      </Card>

      {/* Shop Details Modal */}
      <Modal
        title="Edit Shop Details"
        open={isShopModalOpen}
        onCancel={() => setIsShopModalOpen(false)}
        footer={null}
      >
        <Form
          form={shopForm}
          layout="vertical"
          onFinish={handleShopUpdate}
          initialValues={{
            name: organization.name,
            description: organization.description,
          }}
        >
          <Form.Item name="name" label="Shop Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isUpdatingOrg}>
                Update
              </Button>
              <Button onClick={() => setIsShopModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Branding Modal */}
      <Modal
        title="Update Branding"
        open={isBrandingModalOpen}
        onCancel={() => setIsBrandingModalOpen(false)}
        footer={null}
      >
        <Form
          form={brandingForm}
          layout="vertical"
          onFinish={handleBrandingUpdate}
          initialValues={{
            primaryColor: organization.primary_color || '#1890ff',
            secondaryColor: organization.secondary_color || '#52c41a',
          }}
        >
          <Form.Item label="Logo">
            <Upload
              beforeUpload={(file) => {
                setLogoFile(file);
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Logo</Button>
            </Upload>
            {organization.logo_url && (
              <img
                src={organization.logo_url}
                alt="Current logo"
                style={{ marginTop: 8, maxWidth: 200 }}
              />
            )}
          </Form.Item>

          <Form.Item label="Banner">
            <Upload
              beforeUpload={(file) => {
                setBannerFile(file);
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Banner</Button>
            </Upload>
            {organization.banner_url && (
              <img
                src={organization.banner_url}
                alt="Current banner"
                style={{ marginTop: 8, maxWidth: '100%' }}
              />
            )}
          </Form.Item>

          <Form.Item name="primaryColor" label="Primary Color">
            <ColorPicker showText />
          </Form.Item>

          <Form.Item name="secondaryColor" label="Secondary Color">
            <ColorPicker showText />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdatingTheme || isUploadingLogo || isUploadingBanner}
              >
                Update
              </Button>
              <Button onClick={() => setIsBrandingModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
