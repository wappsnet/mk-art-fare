import { useState } from 'react';
import { useParams } from 'react-router';
import {
  Typography,
  Button,
  Space,
  Drawer,
  Form,
  Input,
  message,
  Upload,
  ColorPicker,
  Row,
  Col,
  Divider,
  Tag,
  Descriptions,
} from 'antd';
import type { Color } from 'antd/es/color-picker';
import {
  UploadOutlined,
  ShopOutlined,
  BgColorsOutlined,
  PictureOutlined,
  EditOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import {
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
  useUpdateOrganizationThemeMutation,
  useUploadOrganizationLogoMutation,
  useUploadOrganizationBannerMutation,
} from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import {
  PageContainer,
  SectionCard,
  LogoImageStyled,
  BannerImageStyled,
  ColorSwatchContainer,
  ColorSwatch,
  ImagePreviewContainer,
  EmptyImageContainer,
  FullWidthSpace,
  CenteredSpace,
} from './styles';

const { Title, Text, Paragraph } = Typography;

// eslint-disable-next-line complexity
const ShopSettingsPage = () => {
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

  interface BrandingUpdateValues {
    primaryColor: string | Color;
    secondaryColor: string | Color;
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

  const toHexString = (color: string | Color): string => {
    return typeof color === 'string' ? color : color.toHexString();
  };

  const handleBrandingUpdate = async (values: BrandingUpdateValues) => {
    try {
      await updateTheme({
        id: orgId,
        theme: {
          primaryColor: toHexString(values.primaryColor),
          secondaryColor: toHexString(values.secondaryColor),
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

  if (organization === null || organization === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <Space direction="vertical" size="large">
        <div>
          <Title level={2}>
            <ShopOutlined /> Shop Settings
          </Title>
          <Paragraph type="secondary">
            Manage your shop information, branding, and appearance
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            {/* Basic Information Card */}
            <SectionCard
              title={
                <Space>
                  <ShopOutlined />
                  <span>Basic Information</span>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsShopModalOpen(true)}
                >
                  Edit
                </Button>
              }
            >
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Shop Name">
                  <Text strong>{organization.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <LinkOutlined /> Shop URL
                    </Space>
                  }
                >
                  <Tag color="blue">artfare.com/{organization.slug}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {organization.description || <Text type="secondary">No description</Text>}
                </Descriptions.Item>
              </Descriptions>
            </SectionCard>

            {/* Theme Colors Card */}
            <SectionCard
              title={
                <Space>
                  <BgColorsOutlined />
                  <span>Theme Colors</span>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsBrandingModalOpen(true)}
                >
                  Edit
                </Button>
              }
            >
              <Paragraph type="secondary">Customize your shop's color scheme</Paragraph>
              <ColorSwatchContainer>
                <ColorSwatch $color={organization.primary_color || '#1890ff'}>
                  <div className="color-box" />
                  <CenteredSpace>
                    <Space direction="vertical" size={0}>
                      <Text strong>Primary</Text>
                      <Text type="secondary">{organization.primary_color || '#1890ff'}</Text>
                    </Space>
                  </CenteredSpace>
                </ColorSwatch>
                <ColorSwatch $color={organization.secondary_color || '#52c41a'}>
                  <div className="color-box" />
                  <CenteredSpace>
                    <Space direction="vertical" size={0}>
                      <Text strong>Secondary</Text>
                      <Text type="secondary">{organization.secondary_color || '#52c41a'}</Text>
                    </Space>
                  </CenteredSpace>
                </ColorSwatch>
              </ColorSwatchContainer>
            </SectionCard>
          </Col>

          <Col xs={24} lg={12}>
            {/* Branding Images Card */}
            <SectionCard
              title={
                <Space>
                  <PictureOutlined />
                  <span>Branding Images</span>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsBrandingModalOpen(true)}
                >
                  Edit
                </Button>
              }
            >
              <Space direction="vertical" size="large">
                <FullWidthSpace>
                  <Text strong>Logo</Text>
                  <ImagePreviewContainer>
                    {organization.logo_url ? (
                      <LogoImageStyled src={organization.logo_url} alt="Shop logo" />
                    ) : (
                      <EmptyImageContainer>
                        <PictureOutlined className="empty-icon" />
                        <div>No logo uploaded</div>
                      </EmptyImageContainer>
                    )}
                  </ImagePreviewContainer>
                </FullWidthSpace>

                <Divider />

                <FullWidthSpace>
                  <Text strong>Banner</Text>
                  <ImagePreviewContainer>
                    {organization.banner_url ? (
                      <BannerImageStyled src={organization.banner_url} alt="Shop banner" />
                    ) : (
                      <EmptyImageContainer>
                        <PictureOutlined className="empty-icon" />
                        <div>No banner uploaded</div>
                      </EmptyImageContainer>
                    )}
                  </ImagePreviewContainer>
                </FullWidthSpace>
              </Space>
            </SectionCard>
          </Col>
        </Row>
      </Space>

      {/* Shop Details Drawer */}
      <Drawer
        title="Edit Shop Details"
        open={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        width={500}
        footer={
          <Space>
            <Button onClick={() => setIsShopModalOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => shopForm.submit()} loading={isUpdatingOrg}>
              Update
            </Button>
          </Space>
        }
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
        </Form>
      </Drawer>

      {/* Branding Drawer */}
      <Drawer
        title="Update Branding"
        open={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        width={600}
        footer={
          <Space>
            <Button onClick={() => setIsBrandingModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => brandingForm.submit()}
              loading={isUpdatingTheme || isUploadingLogo || isUploadingBanner}
            >
              Update
            </Button>
          </Space>
        }
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
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default ShopSettingsPage;
