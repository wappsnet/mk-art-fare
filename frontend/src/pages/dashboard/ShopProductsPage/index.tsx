import { useState } from 'react';
import { useParams } from 'react-router';
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
import { Product, ProductFormData } from '@/types/common';
import { getErrorMessage } from '@/types/errors';
import {
  TopSpaceStyled,
  ProductImageStyled,
  PlaceholderImageStyled,
  ProductActionsStyled,
  FullWidthInputStyled,
} from './styles';

const { Text } = Typography;
const { Option } = Select;

export const ShopProductsPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [managingImagesProduct, setManagingImagesProduct] = useState<Product | null>(null);
  const [productForm] = Form.useForm();

  const { data: productsData } = useGetOrganizationProductsByIdQuery(orgId);
  const { data: categoriesData } = useGetOrganizationCategoriesQuery(orgId);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = Array.isArray(productsData?.data) ? productsData.data : [];
  const allCategories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

  const openProductModal = (product?: Product) => {
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

  const handleProductSubmit = async (values: ProductFormData) => {
    try {
      const productData = {
        ...values,
        price: String(values.price),
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, data: productData }).unwrap();
        message.success('Product updated successfully!');
      } else {
        await createProduct({ organization_id: orgId, ...productData }).unwrap();
        message.success('Product created successfully!');
      }
      setIsProductModalOpen(false);
      productForm.resetFields();
    } catch (error) {
      message.error(
        getErrorMessage(error) || `Failed to ${editingProduct ? 'update' : 'create'} product`
      );
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId).unwrap();
      message.success('Product deleted successfully!');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to delete product');
    }
  };

  return (
    <div>
      <TopSpaceStyled>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openProductModal()}>
          Add Product
        </Button>
      </TopSpaceStyled>

      {products.length > 0 ? (
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col xs={24} sm={12} lg={8} key={product.id}>
              <Card
                hoverable
                cover={
                  product.images?.[0]?.url ? (
                    <ProductImageStyled alt={product.name} src={product.images[0].url} />
                  ) : (
                    <PlaceholderImageStyled>
                      <Text type="secondary">No Image</Text>
                    </PlaceholderImageStyled>
                  )
                }
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <>
                      <Text strong>${product.price.toFixed(2)}</Text>
                      <br />
                      <Text type="secondary">Stock: {product.stock_quantity}</Text>
                    </>
                  }
                />
                <ProductActionsStyled direction="vertical">
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
                </ProductActionsStyled>
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
            <FullWidthInputStyled>
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
            </FullWidthInputStyled>
          </Form.Item>
          <Form.Item name="stock_quantity" label="Stock Quantity" rules={[{ required: true }]}>
            <FullWidthInputStyled>
              <InputNumber min={0} style={{ width: '100%' }} />
            </FullWidthInputStyled>
          </Form.Item>
          <Form.Item name="sku" label="SKU">
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="Category">
            <Select placeholder="Select category" allowClear>
              {allCategories.map((cat) => (
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
