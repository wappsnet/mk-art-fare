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
  useGetOrganizationProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrganizationCategoriesQuery,
  useGetShopCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/services/apiSlice';
import type { Category } from '../types';

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
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [managingImagesProduct, setManagingImagesProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [shopForm] = Form.useForm();
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
  const { data: shopCategoriesData, refetch: refetchCategories } = useGetShopCategoriesQuery(
    parseInt(id || '0'),
    {
      skip: !id,
    }
  );

  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const products = productsData?.data || [];
  const allCategories = allCategoriesData?.data || [];
  const shopCategories = shopCategoriesData?.data || [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
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
      refetchCategories();
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
      refetchCategories();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteCategory(categoryId).unwrap();
      message.success('Category deleted successfully!');
      refetchCategories();
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
                      product.image_url ? (
                        <img
                          alt={product.name}
                          src={product.image_url}
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
                    <Space style={{ marginTop: 16 }} direction="vertical" style={{ width: '100%' }}>
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
          <Space style={{ marginBottom: 16 }} direction="vertical" style={{ width: '100%' }}>
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
