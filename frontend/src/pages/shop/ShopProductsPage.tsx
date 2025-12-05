import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  InputNumber,
  Select,
} from 'antd';
import { PlusOutlined, PictureOutlined } from '@ant-design/icons';
import {
  useGetOrganizationProductsByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrganizationCategoriesQuery,
} from '@/services/apiSlice';
import { ProductImageManager } from '@/components/ProductImageManager';

const { Text } = Typography;
const { Option } = Select;

export const ShopProductsPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [managingImagesProduct, setManagingImagesProduct] = useState<any>(null);
  const [productForm] = Form.useForm();

  const { data: productsData } = useGetOrganizationProductsByIdQuery(orgId);
  const { data: categoriesData } = useGetOrganizationCategoriesQuery(orgId);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = productsData?.data || [];
  const allCategories = categoriesData?.data || [];

  const openProductModal = (product?: any) => {
    setEditingProduct(product || null);
    if (product) {
      productForm.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        sku: product.sku,
        category_id: product.category_id,
      });
    } else {
      productForm.resetFields();
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (values: any) => {
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, ...values }).unwrap();
        message.success('Product updated successfully!');
      } else {
        await createProduct({ organizationId: orgId, ...values }).unwrap();
        message.success('Product created successfully!');
      }
      setIsProductModalOpen(false);
      productForm.resetFields();
    } catch (error: any) {
      message.error(
        error?.data?.message || `Failed to ${editingProduct ? 'update' : 'create'} product`
      );
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId).unwrap();
      message.success('Product deleted successfully!');
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openProductModal()}>
          Add Product
        </Button>
      </Space>

      {products.length > 0 ? (
        <Row gutter={[16, 16]}>
          {products.map((product: any) => (
            <Col xs={24} sm={12} lg={8} key={product.id}>
              <Card
                hoverable
                cover={
                  product.images?.[0]?.image_url ? (
                    <img
                      alt={product.name}
                      src={product.images[0].image_url}
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
                      <Text type="secondary">No Image</Text>
                    </div>
                  )
                }
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <>
                      <Text strong>${Number.parseFloat(product.price).toFixed(2)}</Text>
                      <br />
                      <Text type="secondary">Stock: {product.stock_quantity}</Text>
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

      {/* Product Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        open={isProductModalOpen}
        onCancel={() => {
          setIsProductModalOpen(false);
          productForm.resetFields();
        }}
        footer={null}
      >
        <Form form={productForm} layout="vertical" onFinish={handleProductSubmit}>
          <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item name="stock_quantity" label="Stock Quantity" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sku" label="SKU">
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="Category">
            <Select placeholder="Select category" allowClear>
              {allCategories.map((cat: any) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                {editingProduct ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Manager */}
      <Modal
        title={`Manage Images - ${managingImagesProduct?.name || 'Product'}`}
        open={isImageManagerOpen}
        onCancel={() => {
          setIsImageManagerOpen(false);
          setManagingImagesProduct(null);
        }}
        footer={null}
        width={900}
        destroyOnHidden
      >
        {managingImagesProduct && (
          <ProductImageManager
            productId={managingImagesProduct.id}
            images={managingImagesProduct.images || []}
            onUpdate={() => {
              // Refresh products list after image update
              setIsImageManagerOpen(false);
              setManagingImagesProduct(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};
