import { useState } from 'react';
import { useParams } from 'react-router';
import {
  Card,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Upload,
  ColorPicker,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
  useUpdateOrganizationThemeMutation,
  useUploadOrganizationLogoMutation,
  useUploadOrganizationBannerMutation,
} from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { FullWidthSpaceStyled, LogoImageStyled, BannerImageStyled } from './styles';

const { Title, Text } = Typography;

export const ShopSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

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

  interface ShopUpdateValues {
    name?: string;
    slug?: string;
    description?: string;
  }

  const handleShopUpdate = async (values: ShopUpdateValues) => {
    try {
      await updateOrganization({ id: orgId, data: values }).unwrap();
      message.success('Shop updated successfully!');
      setIsShopModalOpen(false);
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update shop');
    }
  };

  const handleBrandingUpdate = async (values: Record<string, unknown>) => {
    try {
      const getPrimaryColor = (): string => {
        const color = values.primaryColor;
        if (
          color &&
          typeof color === 'object' &&
          'toHexString' in color &&
          typeof color.toHexString === 'function'
        ) {
          return color.toHexString();
        }
        return typeof color === 'string' ? color : '#1890ff';
      };

      const getSecondaryColor = (): string => {
        const color = values.secondaryColor;
        if (
          color &&
          typeof color === 'object' &&
          'toHexString' in color &&
          typeof color.toHexString === 'function'
        ) {
          return color.toHexString();
        }
        return typeof color === 'string' ? color : '#52c41a';
      };

      const primaryColor = getPrimaryColor();
      const secondaryColor = getSecondaryColor();

      await updateTheme({
        id: orgId,
        theme: {
          primaryColor,
          secondaryColor,
        },
      }).unwrap();

      if (logoFile) {
        await uploadLogo({ id: orgId, file: logoFile }).unwrap();
      }

      if (bannerFile) {
        await uploadBanner({ id: orgId, file: bannerFile }).unwrap();
      }

      message.success('Branding updated successfully!');
      setIsBrandingModalOpen(false);
      setLogoFile(null);
      setBannerFile(null);
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update branding');
    }
  };

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Card>
        <FullWidthSpaceStyled direction="vertical" size="large">
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
        </FullWidthSpaceStyled>
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
              <LogoImageStyled src={organization.logo_url} alt="Current logo" />
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
              <BannerImageStyled src={organization.banner_url} alt="Current banner" />
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
