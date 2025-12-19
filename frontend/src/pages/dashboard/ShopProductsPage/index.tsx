import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Drawer,
  Modal,
  Form,
  Input,
  message,
  InputNumber,
  Select,
  Divider,
} from 'antd';
import { PlusOutlined, PictureOutlined } from '@ant-design/icons';
import {
  useGetOrganizationProductsByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrganizationCategoriesQuery,
  useGetFieldGroupsQuery,
  useGetProductFieldGroupsQuery,
  useGetProductFieldValuesQuery,
  useAssignFieldGroupToProductMutation,
  useUnassignFieldGroupFromProductMutation,
  useBatchUpdateProductFieldValuesMutation,
} from '@/services/apiSlice';
import { ProductImageManager } from '@/components/ProductImageManager';
import DynamicFieldRenderer from '@/components/DynamicFieldRenderer';
import { Product, ProductFormData } from '@/types/common';
import { ProductFieldValues } from '@/types/customFields';
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

const ShopProductsPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [managingImagesProduct, setManagingImagesProduct] = useState<Product | null>(null);
  const [selectedFieldGroups, setSelectedFieldGroups] = useState<number[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<ProductFieldValues>({});
  const [productForm] = Form.useForm();

  const { data: productsData } = useGetOrganizationProductsByIdQuery(orgId);
  const { data: categoriesData } = useGetOrganizationCategoriesQuery(orgId);
  const { data: fieldGroupsData } = useGetFieldGroupsQuery({
    organizationId: orgId,
    includeFields: true,
  });
  const { data: productFieldGroups } = useGetProductFieldGroupsQuery(editingProduct?.id || 0, {
    skip: !editingProduct?.id,
  });
  const { data: productFieldValues } = useGetProductFieldValuesQuery(editingProduct?.id || 0, {
    skip: !editingProduct?.id,
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [assignFieldGroup] = useAssignFieldGroupToProductMutation();
  const [unassignFieldGroup] = useUnassignFieldGroupFromProductMutation();
  const [batchUpdateFieldValues] = useBatchUpdateProductFieldValuesMutation();

  const products = Array.isArray(productsData?.data) ? productsData.data : [];
  const allCategories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

  // Load field groups and values when editing a product
  useEffect(() => {
    if (productFieldGroups?.data) {
      console.log('Loading field groups for product:', editingProduct?.id, productFieldGroups.data);
      setSelectedFieldGroups(productFieldGroups.data.map((g) => g.id));
    }
  }, [productFieldGroups, editingProduct?.id]);

  useEffect(() => {
    if (productFieldValues?.data) {
      console.log('Loading field values for product:', editingProduct?.id, productFieldValues.data);
      const fieldValuesMap: ProductFieldValues = {};
      productFieldValues.data.forEach((fv) => {
        let parsedValue = fv.value;

        // Try to parse JSON strings back to arrays/objects
        if (
          typeof fv.value === 'string' &&
          (fv.value.startsWith('[') || fv.value.startsWith('{'))
        ) {
          try {
            parsedValue = JSON.parse(fv.value);
          } catch (e) {
            // If parsing fails, keep the original string value
            console.warn('Failed to parse field value:', fv.value, e);
          }
        }

        fieldValuesMap[fv.field_definition_id] = parsedValue;
      });
      console.log('Field values map:', fieldValuesMap);
      setCustomFieldValues(fieldValuesMap);
    }
  }, [productFieldValues, editingProduct?.id]);

  // Get all fields from selected field groups
  const allCustomFields =
    fieldGroupsData?.data
      ?.filter((group) => selectedFieldGroups.includes(group.id))
      ?.flatMap((group) => group.fields || []) || [];

  const openProductModal = (product?: Product) => {
    setEditingProduct(product || null);
    setSelectedFieldGroups([]);
    setCustomFieldValues({});

    if (product) {
      productForm.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        sku: product.sku,
        category_id: product.category_id,
      });
      // Custom field groups and values will be loaded by useEffect hooks
    } else {
      productForm.resetFields();
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (values: ProductFormData) => {
    try {
      const productData = {
        ...values,
      };

      let productId: number;

      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, data: productData }).unwrap();
        productId = editingProduct.id;
        message.success('Product updated successfully!');
      } else {
        const result = await createProduct({ organization_id: orgId, ...productData }).unwrap();
        productId = result.data!.id;
        message.success('Product created successfully!');
      }

      // Handle field group assignments
      if (editingProduct) {
        const currentGroups = productFieldGroups?.data?.map((g) => g.id) || [];
        const added = selectedFieldGroups.filter((id) => !currentGroups.includes(id));
        const removed = currentGroups.filter((id) => !selectedFieldGroups.includes(id));

        // Assign new groups
        for (const groupId of added) {
          await assignFieldGroup({ productId, fieldGroupId: groupId }).unwrap();
        }

        // Unassign removed groups
        for (const groupId of removed) {
          await unassignFieldGroup({ productId, fieldGroupId: groupId }).unwrap();
        }
      } else {
        // For new products, assign all selected field groups
        for (const groupId of selectedFieldGroups) {
          await assignFieldGroup({ productId, fieldGroupId: groupId }).unwrap();
        }
      }

      // Save custom field values
      if (Object.keys(customFieldValues).length > 0) {
        console.log('Saving custom field values for product:', productId, customFieldValues);

        // Convert arrays and objects to JSON strings for backend storage
        const processedFields: ProductFieldValues = {};
        for (const [fieldId, value] of Object.entries(customFieldValues)) {
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            processedFields[fieldId] = JSON.stringify(value);
          } else {
            processedFields[fieldId] = value;
          }
        }
        console.log('Processed field values:', processedFields);

        const result = await batchUpdateFieldValues({
          productId,
          fields: processedFields,
        }).unwrap();
        console.log('Save result:', result);
        message.success('Custom fields saved successfully!');
      } else {
        console.log('No custom field values to save');
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      setSelectedFieldGroups([]);
      setCustomFieldValues({});
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

      {/* Product Drawer */}
      <Drawer
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        open={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
          setSelectedFieldGroups([]);
          setCustomFieldValues({});
          productForm.resetFields();
        }}
        width={700}
        footer={
          <Space>
            <Button
              onClick={() => {
                setIsProductModalOpen(false);
                setEditingProduct(null);
                setSelectedFieldGroups([]);
                setCustomFieldValues({});
                productForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => productForm.submit()}
              loading={isCreating || isUpdating}
            >
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </Space>
        }
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
              <InputNumber min={0} step={0.01} prefix="$" />
            </FullWidthInputStyled>
          </Form.Item>
          <Form.Item name="stock_quantity" label="Stock Quantity" rules={[{ required: true }]}>
            <FullWidthInputStyled>
              <InputNumber min={0} />
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

          <Divider>Custom Fields</Divider>

          <Form.Item label="Field Groups">
            <Select
              mode="multiple"
              placeholder="Select field groups to add custom fields"
              value={selectedFieldGroups}
              onChange={setSelectedFieldGroups}
              options={fieldGroupsData?.data?.map((group) => ({
                label: group.name,
                value: group.id,
              }))}
            />
          </Form.Item>

          {allCustomFields.length > 0 && (
            <>
              {allCustomFields.map((field) => (
                <DynamicFieldRenderer
                  key={field.id}
                  field={field}
                  value={customFieldValues[field.id]}
                  onChange={(value) =>
                    setCustomFieldValues((prev) => ({
                      ...prev,
                      [field.id]: value,
                    }))
                  }
                />
              ))}
            </>
          )}
        </Form>
      </Drawer>

      {/* Image Manager */}
      <Drawer
        title={`Manage Images - ${managingImagesProduct?.name || 'Product'}`}
        open={isImageManagerOpen}
        onClose={() => {
          setIsImageManagerOpen(false);
          setManagingImagesProduct(null);
        }}
        width={900}
        destroyOnHidden
        footer={
          <Button
            onClick={() => {
              setIsImageManagerOpen(false);
              setManagingImagesProduct(null);
            }}
          >
            Close
          </Button>
        }
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
      </Drawer>
    </div>
  );
};

export default ShopProductsPage;
