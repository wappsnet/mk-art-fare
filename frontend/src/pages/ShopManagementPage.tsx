import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Spin,
  InputNumber,
  Select,
  Table,
  Tag,
  ColorPicker,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { Layout } from '../components/Layout';
import { ProductImageManager } from '../components/ProductImageManager';
import { useAppSelector } from '../hooks/useRedux';
import {
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
  useUpdateOrganizationThemeMutation,
  useUploadOrganizationLogoMutation,
  useUploadOrganizationBannerMutation,
  useGetOrganizationProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrganizationCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetOrganizationOrdersQuery,
  useGetOrganizationStatsQuery,
} from '@/services/apiSlice';
import type { Category } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

const Header = styled.div`
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ShopManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [managingImagesProduct, setManagingImagesProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [shopForm] = Form.useForm();
  const [brandingForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  const { data: organizationData, isLoading: orgLoading } = useGetOrganizationByIdQuery(
    parseInt(id || '0'),
    {
      skip: !id,
    }
  );
  const organization = organizationData?.data;

  const { data: productsData, refetch: refetchProducts } = useGetOrganizationProductsQuery(
    organization?.slug || '',
    {
      skip: !organization?.slug,
    }
  );
  const { data: allCategoriesData } = useGetOrganizationCategoriesQuery(parseInt(id || '0'), {
    skip: !id,
  });
  const { data: ordersData } = useGetOrganizationOrdersQuery(
    { organizationId: parseInt(id || '0'), page: 1, limit: 10 },
    {
      skip: !id,
    }
  );
  const { data: statsData } = useGetOrganizationStatsQuery(parseInt(id || '0'), {
    skip: !id,
  });

  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();
  const [updateOrganizationTheme, { isLoading: isUpdatingTheme }] =
    useUpdateOrganizationThemeMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadOrganizationLogoMutation();
  const [uploadBanner, { isLoading: isUploadingBanner }] = useUploadOrganizationBannerMutation();
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const products = productsData?.data || [];
  const allCategories = allCategoriesData?.data || [];
  const orders = ordersData?.data?.data || [];
  const stats = statsData?.data;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (organization) {
      shopForm.setFieldsValue({
        name: organization.name,
        description: organization.description,
      });
    }
  }, [organization, shopForm]);

  // Keep the managingImagesProduct in sync with latest products data so image list updates after add/delete
  useEffect(() => {
    if (isImageManagerOpen && managingImagesProduct) {
      const updated = products.find((p: any) => p.id === managingImagesProduct.id);
      if (updated && updated !== managingImagesProduct) {
        setManagingImagesProduct(updated);
      }
    }
  }, [products, isImageManagerOpen, managingImagesProduct]);

  const handleUpdateShop = async (values: any) => {
    if (!organization) return;

    try {
      await updateOrganization({ id: organization.id, data: values }).unwrap();
      message.success('Shop updated successfully!');
      setIsShopModalOpen(false);
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update shop');
    }
  };

  const handleUpdateBranding = async (values: any) => {
    if (!organization) return;

    try {
      // Upload logo if provided
      if (logoFile) {
        await uploadLogo({ id: organization.id, file: logoFile }).unwrap();
        setLogoFile(null);
      }

      // Upload banner if provided
      if (bannerFile) {
        await uploadBanner({ id: organization.id, file: bannerFile }).unwrap();
        setBannerFile(null);
      }

      // Update theme colors
      if (
        values.primaryColor ||
        values.secondaryColor ||
        values.backgroundColor ||
        values.textColor
      ) {
        await updateOrganizationTheme({
          id: organization.id,
          theme: {
            primaryColor:
              typeof values.primaryColor === 'object'
                ? values.primaryColor.toHexString()
                : values.primaryColor,
            secondaryColor:
              typeof values.secondaryColor === 'object'
                ? values.secondaryColor.toHexString()
                : values.secondaryColor,
            backgroundColor:
              typeof values.backgroundColor === 'object'
                ? values.backgroundColor.toHexString()
                : values.backgroundColor,
            textColor:
              typeof values.textColor === 'object'
                ? values.textColor.toHexString()
                : values.textColor,
          },
        }).unwrap();
      }

      message.success('Branding updated successfully!');
      setIsBrandingModalOpen(false);
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update branding');
    }
  };

  const handleCreateProduct = async (values: any) => {
    if (!organization) return;

    try {
      // Convert form field names to backend expected format (camelCase)
      const productData = {
        organizationId: organization.id,
        categoryId: values.category_id,
        name: values.name,
        description: values.description,
        price: values.price,
        stockQuantity: values.stock_quantity,
        sku: values.sku,
      };

      await createProduct(productData).unwrap();
      message.success('Product created successfully!');
      setIsProductModalOpen(false);
      productForm.resetFields();
      refetchProducts();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to create product');
    }
  };

  const handleUpdateProduct = async (values: any) => {
    if (!editingProduct) return;

    try {
      await updateProduct({ id: editingProduct.id, data: values }).unwrap();
      message.success('Product updated successfully!');
      setIsProductModalOpen(false);
      setEditingProduct(null);
      productForm.resetFields();
      refetchProducts();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId).unwrap();
      message.success('Product deleted successfully!');
      refetchProducts();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to delete product');
    }
  };

  const openProductModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      productForm.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id,
      });
    } else {
      setEditingProduct(null);
      productForm.resetFields();
    }
    setIsProductModalOpen(true);
  };

  const handleCreateCategory = async (values: any) => {
    if (!organization) return;

    try {
      await createCategory({ ...values, organization_id: organization.id }).unwrap();
      message.success('Category created successfully!');
      setIsCategoryModalOpen(false);
      categoryForm.resetFields();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (values: any) => {
    if (!editingCategory) return;

    try {
      await updateCategory({ id: editingCategory.id, data: values }).unwrap();
      message.success('Category updated successfully!');
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      categoryForm.resetFields();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteCategory(categoryId).unwrap();
      message.success('Category deleted successfully!');
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to delete category');
    }
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      categoryForm.setFieldsValue({
        name: category.name,
        description: category.description,
      });
    } else {
      setEditingCategory(null);
      categoryForm.resetFields();
    }
    setIsCategoryModalOpen(true);
  };

  const categoryColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Type',
      dataIndex: 'is_global',
      key: 'is_global',
      render: (isGlobal: boolean) => (
        <Tag color={isGlobal ? 'blue' : 'green'}>{isGlobal ? 'Global' : 'Shop'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Category) =>
        !record.is_global && (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openCategoryModal(record)}>
              Edit
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Category',
                  content: 'Are you sure you want to delete this category?',
                  onOk: () => handleDeleteCategory(record.id),
                });
              }}
            >
              Delete
            </Button>
          </Space>
        ),
    },
  ];

  if (orgLoading || !organization) {
    return (
      <Layout>
        <Container>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        </Container>
      </Layout>
    );
  }

  const tabItems = [
    {
      key: 'products',
      label: 'Products',
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openProductModal()}>
              Add Product
            </Button>
          </Space>

          {products.length > 0 ? (
            <Row gutter={[16, 16]}>
              {products.map((product) => (
                <Col xs={24} sm={12} lg={8} key={product.id}>
                  <Card
                    hoverable
                    cover={
                      product.images && product.images.length > 0 ? (
                        <img
                          alt={product.name}
                          src={
                            product.images.find((img: any) => img.is_thumbnail)?.url ||
                            product.images[0].url
                          }
                          style={{ height: 200, objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 200,
                            background: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          No Image
                        </div>
                      )
                    }
                  >
                    <Card.Meta
                      title={product.name}
                      description={
                        <>
                          <Text>${product.price}</Text>
                          <br />
                          <Text type="secondary">Stock: {product.stock_quantity}</Text>
                          {product.category_name && (
                            <>
                              <br />
                              <Tag>{product.category_name}</Tag>
                            </>
                          )}
                        </>
                      }
                    />
                    <Space style={{ marginTop: 16, width: '100%' }} direction="vertical">
                      <Space>
                        <Button size="small" onClick={() => openProductModal(product)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          icon={<PictureOutlined />}
                          onClick={() => {
                            setManagingImagesProduct(product);
                            setIsImageManagerOpen(true);
                          }}
                        >
                          Images
                        </Button>
                      </Space>
                      <Button
                        size="small"
                        danger
                        block
                        onClick={() => {
                          Modal.confirm({
                            title: 'Delete Product',
                            content: 'Are you sure you want to delete this product?',
                            onOk: () => handleDeleteProduct(product.id),
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Text type="secondary">No products yet. Create your first product!</Text>
          )}
        </div>
      ),
    },
    {
      key: 'categories',
      label: 'Categories',
      children: (
        <div>
          <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCategoryModal()}>
              Create Custom Category
            </Button>
            <Text type="secondary">
              You can use global categories (blue tags) or create shop-specific categories (green
              tags)
            </Text>
          </Space>

          <Table
            columns={categoryColumns}
            dataSource={allCategories}
            rowKey="id"
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: 'orders',
      label: `Orders (${orders.length})`,
      children: (
        <div>
          <Title level={4}>Recent Orders</Title>
          <Table
            dataSource={orders}
            rowKey="id"
            columns={[
              {
                title: 'Order #',
                dataIndex: 'order_number',
                key: 'order_number',
              },
              {
                title: 'Products',
                dataIndex: 'products',
                key: 'products',
                ellipsis: true,
              },
              {
                title: 'Items',
                dataIndex: 'total_items',
                key: 'total_items',
              },
              {
                title: 'Total',
                dataIndex: 'total',
                key: 'total',
                render: (total: string) => `$${parseFloat(total).toFixed(2)}`,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag
                    color={
                      status === 'completed'
                        ? 'green'
                        : status === 'pending'
                          ? 'gold'
                          : status === 'cancelled'
                            ? 'red'
                            : 'blue'
                    }
                  >
                    {status.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Date',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (date: string) => new Date(date).toLocaleDateString(),
              },
            ]}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
    {
      key: 'analytics',
      label: 'Analytics',
      children: (
        <div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Title level={4}>{stats?.total?.total_orders || 0}</Title>
                <Text type="secondary">Total Orders</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Title level={4}>
                  ${parseFloat(stats?.total?.total_revenue || '0').toFixed(2)}
                </Title>
                <Text type="secondary">Total Revenue</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Title level={4}>{stats?.total?.total_items_sold || 0}</Title>
                <Text type="secondary">Items Sold</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Title level={4}>
                  $
                  {stats?.total?.total_orders > 0
                    ? (
                        parseFloat(stats?.total?.total_revenue || '0') / stats?.total?.total_orders
                      ).toFixed(2)
                    : '0.00'}
                </Title>
                <Text type="secondary">Avg Order Value</Text>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Orders by Status">
                {stats?.byStatus && stats.byStatus.length > 0 ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {stats.byStatus.map((item: any) => (
                      <div
                        key={item.status}
                        style={{ display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Tag
                          color={
                            item.status === 'completed'
                              ? 'green'
                              : item.status === 'pending'
                                ? 'gold'
                                : item.status === 'cancelled'
                                  ? 'red'
                                  : 'blue'
                          }
                        >
                          {item.status.toUpperCase()}
                        </Tag>
                        <Text>
                          {item.count} orders (${Number.parseFloat(item.revenue).toFixed(2)})
                        </Text>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">No data available</Text>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Top Selling Products">
                {stats?.topProducts && stats.topProducts.length > 0 ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {stats.topProducts.map((product: any) => (
                      <div
                        key={product.product_name}
                        style={{ display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Text strong>{product.product_name}</Text>
                        <Text>
                          {product.total_sold} sold ($
                          {Number.parseFloat(product.revenue).toFixed(2)})
                        </Text>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">No data available</Text>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'settings',
      label: 'Shop Settings',
      children: (
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
                Customize Branding
              </Button>
            </div>
            <div>
              <Space direction="vertical" style={{ marginTop: 16, width: '100%' }}>
                <Title level={4}>Branding Configurations</Title>
                {organization.logo_url && (
                  <div>
                    <Text strong>Logo:</Text>
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={organization.logo_url}
                        alt="Shop logo"
                        style={{
                          maxWidth: 150,
                          maxHeight: 150,
                          objectFit: 'contain',
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          padding: 8,
                        }}
                      />
                    </div>
                  </div>
                )}
                {!organization.logo_url && (
                  <Text>
                    <strong>Logo:</strong> Not set
                  </Text>
                )}
                {organization.banner_url && (
                  <div>
                    <Text strong>Banner:</Text>
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={organization.banner_url}
                        alt="Shop banner"
                        style={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          objectFit: 'cover',
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                )}
                {!organization.banner_url && (
                  <Text>
                    <strong>Banner:</strong> Not set
                  </Text>
                )}
              </Space>
            </div>
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <Layout>
      <Container>
        <Header>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dashboard')}
              style={{ marginBottom: 16 }}
            >
              Back to Dashboard
            </Button>
            <Title level={2}>Manage {organization.name}</Title>
            <Text type="secondary">{organization.description}</Text>
          </div>
          <Button onClick={() => navigate(`/shop/${organization.slug}`)}>View Shop</Button>
        </Header>

        <Tabs items={tabItems} />

        {/* Shop Edit Modal */}
        <Modal
          title="Edit Shop Details"
          open={isShopModalOpen}
          onCancel={() => setIsShopModalOpen(false)}
          footer={null}
        >
          <Form form={shopForm} layout="vertical" onFinish={handleUpdateShop}>
            <Form.Item
              name="name"
              label="Shop Name"
              rules={[{ required: true, message: 'Please enter shop name' }]}
            >
              <Input placeholder="e.g., My Art Studio" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} placeholder="Tell customers about your shop..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isUpdating}>
                  Update Shop
                </Button>
                <Button onClick={() => setIsShopModalOpen(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Branding Modal */}
        <Modal
          title="Customize Branding & Theme"
          open={isBrandingModalOpen}
          onCancel={() => setIsBrandingModalOpen(false)}
          footer={null}
          width={700}
        >
          <Form form={brandingForm} layout="vertical" onFinish={handleUpdateBranding}>
            <Title level={5}>Logo & Images</Title>
            <Form.Item label="Logo Image">
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  setLogoFile(file);
                  return false;
                }}
                onRemove={() => setLogoFile(null)}
              >
                {!logoFile && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Logo</div>
                  </div>
                )}
              </Upload>
              {organization?.logo_url && !logoFile && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Current: </Text>
                  <img
                    src={organization.logo_url}
                    alt="Current logo"
                    style={{ maxWidth: 100, maxHeight: 100, objectFit: 'contain' }}
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item label="Banner Image">
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  setBannerFile(file);
                  return false;
                }}
                onRemove={() => setBannerFile(null)}
              >
                {!bannerFile && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Banner</div>
                  </div>
                )}
              </Upload>
              {organization?.banner_url && !bannerFile && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Current: </Text>
                  <img
                    src={organization.banner_url}
                    alt="Current banner"
                    style={{ maxWidth: 200, maxHeight: 100, objectFit: 'contain' }}
                  />
                </div>
              )}
            </Form.Item>

            <Title level={5} style={{ marginTop: 24 }}>
              Theme Colors
            </Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="primaryColor" label="Primary Color">
                  <ColorPicker showText format="hex" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="secondaryColor" label="Secondary Color">
                  <ColorPicker showText format="hex" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="backgroundColor" label="Background Color">
                  <ColorPicker showText format="hex" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="textColor" label="Text Color">
                  <ColorPicker showText format="hex" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 16 }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isUpdatingTheme || isUpdating || isUploadingLogo || isUploadingBanner}
                >
                  Save Branding
                </Button>
                <Button onClick={() => setIsBrandingModalOpen(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Product Modal */}
        <Modal
          title={editingProduct ? 'Edit Product' : 'Add Product'}
          open={isProductModalOpen}
          onCancel={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
            productForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={productForm}
            layout="vertical"
            onFinish={editingProduct ? handleUpdateProduct : handleCreateProduct}
          >
            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: 'Please enter product name' }]}
            >
              <Input placeholder="e.g., Abstract Painting" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={4} placeholder="Describe your product..." />
            </Form.Item>

            <Form.Item name="category_id" label="Category">
              <Select placeholder="Select a category" allowClear>
                {allCategories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name} {cat.is_global ? '(Global)' : '(Shop)'}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                prefix="$"
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="stock_quantity"
              label="Stock Quantity"
              rules={[{ required: true, message: 'Please enter stock quantity' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={editingProduct ? isUpdatingProduct : isCreatingProduct}
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                    productForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Category Modal */}
        <Modal
          title={editingCategory ? 'Edit Category' : 'Create Custom Category'}
          open={isCategoryModalOpen}
          onCancel={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
            categoryForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={categoryForm}
            layout="vertical"
            onFinish={editingCategory ? handleUpdateCategory : handleCreateCategory}
          >
            <Form.Item
              name="name"
              label="Category Name"
              rules={[{ required: true, message: 'Please enter category name' }]}
            >
              <Input placeholder="e.g., Custom Art" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Describe this category..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={editingCategory ? isUpdatingCategory : isCreatingCategory}
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                    categoryForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Image Manager Modal */}
        <Modal
          title={`Manage Images - ${managingImagesProduct?.name || ''}`}
          open={isImageManagerOpen}
          onCancel={() => {
            setIsImageManagerOpen(false);
            setManagingImagesProduct(null);
          }}
          footer={null}
          width={800}
        >
          {managingImagesProduct && (
            <ProductImageManager
              productId={managingImagesProduct.id}
              images={managingImagesProduct.images || []}
              onUpdate={refetchProducts}
            />
          )}
        </Modal>
      </Container>
    </Layout>
  );
};
