import { FC, useState, useEffect, useMemo } from 'react';

import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stack,
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'react-router';

import AppDataGrid from '@/components/AppDataGrid';
import AppDrawer from '@/components/AppDrawer';
import { useConfirm } from '@/components/ConfirmDialog';
import { DynamicFieldRenderer } from '@/components/DynamicFieldRenderer';
import { ProductImageManager } from '@/components/ProductImageManager';
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
import { Product, ProductFormData } from '@/types/common';
import { getErrorMessage } from '@/types/errors';
import { FieldValue } from '@/types/fields';
import { generateFieldDefinition } from '@/utils/fieldHelpers.ts';
import { message } from '@/utils/notification';

const ShopProductsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [managingImagesProduct, setManagingImagesProduct] = useState<Product | null>(null);
  const [selectedFieldGroupIds, setSelectedFieldGroupIds] = useState<number[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<number, FieldValue>>({});

  const { confirm } = useConfirm();

  const { control, handleSubmit, reset } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      sku: '',
      category_id: undefined,
    },
  });

  const { data: productsData } = useGetOrganizationProductsByIdQuery(orgId);
  const { data: categoriesData } = useGetOrganizationCategoriesQuery(orgId);
  const { data: fieldGroupsData } = useGetFieldGroupsQuery({
    organizationId: orgId,
    includeFields: true,
  });
  const { data: productFieldGroupsData } = useGetProductFieldGroupsQuery(editingProduct?.id || 0, {
    skip: !editingProduct,
  });
  const { data: productFieldValuesData } = useGetProductFieldValuesQuery(editingProduct?.id || 0, {
    skip: !editingProduct,
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [assignFieldGroup] = useAssignFieldGroupToProductMutation();
  const [unassignFieldGroup] = useUnassignFieldGroupFromProductMutation();
  const [batchUpdateFieldValues] = useBatchUpdateProductFieldValuesMutation();

  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  const allCategories = useMemo(() => categoriesData?.data ?? [], [categoriesData?.data]);
  const fieldGroups = useMemo(() => fieldGroupsData?.data ?? [], [fieldGroupsData?.data]);
  const productFieldGroups = useMemo(() => {
    return productFieldGroupsData?.data ?? [];
  }, [productFieldGroupsData?.data]);

  const productFieldValues = useMemo(() => {
    return productFieldValuesData?.data ?? [];
  }, [productFieldValuesData?.data]);

  useEffect(() => {
    if (editingProduct && productFieldGroups.length > 0) {
      setSelectedFieldGroupIds(productFieldGroups.map((fg) => fg.id));
    }
  }, [editingProduct, productFieldGroups]);

  useEffect(() => {
    if (editingProduct && productFieldValues.length > 0) {
      const typedValues: Record<number, FieldValue> = {};

      productFieldValues.forEach((fv) => {
        typedValues[fv.field_definition_id] = fv;
      });

      setFieldValues(typedValues);
    }
  }, [editingProduct, productFieldValues]);

  const selectedFieldDefinitions = useMemo(
    () =>
      fieldGroups
        .filter((fg) => selectedFieldGroupIds.includes(fg.id))
        .flatMap((fg) => fg.fields || [])
        .map((field) =>
          generateFieldDefinition({
            field,
            fieldValue: fieldValues[field.id],
          })
        ),
    [fieldGroups, fieldValues, selectedFieldGroupIds]
  );

  const updateFieldValue = (updatedFieldValue: FieldValue) => {
    setFieldValues((prev) => ({
      ...prev,
      [updatedFieldValue.field_definition_id]: updatedFieldValue,
    }));
  };

  const openProductDrawer = (product?: Product) => {
    setEditingProduct(product || null);

    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        sku: product.sku,
        category_id: product.category_id,
      });
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        sku: '',
        category_id: undefined,
      });
      setSelectedFieldGroupIds([]);
      setFieldValues({});
    }
    setIsProductDrawerOpen(true);
  };

  const saveProduct = async (values: ProductFormData): Promise<number> => {
    if (editingProduct) {
      await updateProduct({
        id: editingProduct.id,
        data: values,
      }).unwrap();
      return editingProduct.id;
    }

    const result = await createProduct({ organization_id: orgId, ...values }).unwrap();
    if (!result.data) {
      throw new Error('Failed to create product');
    }
    return result.data.id;
  };

  const syncFieldGroups = async (productId: number) => {
    const previousFieldGroupIds = editingProduct ? productFieldGroups.map((fg) => fg.id) : [];
    const groupsToAdd = selectedFieldGroupIds.filter((id) => !previousFieldGroupIds.includes(id));
    const groupsToRemove = previousFieldGroupIds.filter(
      (id) => !selectedFieldGroupIds.includes(id)
    );

    await Promise.all([
      ...groupsToAdd.map((groupId) =>
        assignFieldGroup({ productId, fieldGroupId: groupId }).unwrap()
      ),
      ...groupsToRemove.map((groupId) =>
        unassignFieldGroup({ productId, fieldGroupId: groupId }).unwrap()
      ),
    ]);
  };

  const saveFieldValues = async (productId: number) => {
    const fieldValueUpdates: Record<number, FieldValue['value']> = {};
    selectedFieldDefinitions.forEach((field) => {
      if (field.fieldValue) {
        fieldValueUpdates[field.id] = field.fieldValue.value;
      }
    });

    if (Object.keys(fieldValueUpdates).length > 0) {
      await batchUpdateFieldValues({ productId, fields: fieldValueUpdates }).unwrap();
    }
  };

  const resetProductForm = () => {
    setIsProductDrawerOpen(false);
    setEditingProduct(null);
    reset();
    setSelectedFieldGroupIds([]);
    setFieldValues({});
  };

  const handleProductSubmit = async (values: ProductFormData) => {
    try {
      const productId = await saveProduct(values);
      await syncFieldGroups(productId);
      await saveFieldValues(productId);

      message.success(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
      resetProductForm();
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
    <Stack spacing={3}>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openProductDrawer()}>
          Add Product
        </Button>
      </Box>

      <AppDataGrid
        data={products}
        emptyContent={
          <Typography color="text.secondary">No products yet. Create your first product!</Typography>
        }
        renderItem={(product) => (
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {product.images?.[0]?.url ? (
              <CardMedia
                component="img"
                height="200"
                image={product.images[0].url}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  height: 200,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">No Image</Typography>
              </Box>
            )}
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                ${product.price.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stock: {product.stock_quantity}
              </Typography>
            </CardContent>
            <CardActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
              <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={() => openProductDrawer(product)}
                  fullWidth
                >
                  Edit
                </Button>
                <Button
                  size="medium"
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={() => {
                    setManagingImagesProduct(product);
                    setIsImageManagerOpen(true);
                  }}
                  fullWidth
                >
                  Images
                </Button>
              </Stack>
              <Button
                size="medium"
                variant="contained"
                color="error"
                fullWidth
                onClick={() => {
                  confirm({
                    title: 'Delete Product',
                    content: 'Are you sure you want to delete this product?',
                    onConfirm: () => handleDeleteProduct(product.id),
                  });
                }}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        )}
        getItemKey={(product) => product.id}
        gridProps={{ xs: 12, sm: 6, lg: 4 }}
        spacing={2}
      />

      {/* Product Drawer */}
      <AppDrawer
        open={isProductDrawerOpen}
        onClose={() => {
          setIsProductDrawerOpen(false);
          setEditingProduct(null);
          reset();
        }}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        width={700}
        footer={
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => {
                setIsProductDrawerOpen(false);
                setEditingProduct(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleProductSubmit)}
              variant="contained"
              disabled={isCreating || isUpdating}
            >
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </Stack>
        }
      >
        <form onSubmit={handleSubmit(handleProductSubmit)}>
          <Stack spacing={3} sx={{ mt: 3 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Product name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Product Name"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Description" multiline rows={3} fullWidth />
              )}
            />

            <Controller
              name="price"
              control={control}
              rules={{ required: 'Price is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Price"
                  type="number"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    input: {
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    },
                    htmlInput: { step: 0.01, min: 0 },
                  }}
                  fullWidth
                />
              )}
            />

            <Controller
              name="stock_quantity"
              control={control}
              rules={{ required: 'Stock quantity is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Stock Quantity"
                  type="number"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{ htmlInput: { min: 0 } }}
                  fullWidth
                />
              )}
            />

            <Controller
              name="sku"
              control={control}
              render={({ field }) => <TextField {...field} label="SKU" fullWidth />}
            />

            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category" value={field.value || ''}>
                    {allCategories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {fieldGroups.length > 0 && (
              <>
                <Divider>Custom Fields</Divider>

                <FormControl fullWidth>
                  <InputLabel>Field Groups</InputLabel>
                  <Select
                    multiple
                    value={selectedFieldGroupIds}
                    onChange={(e) =>
                      setSelectedFieldGroupIds(
                        typeof e.target.value === 'string'
                          ? [Number(e.target.value)]
                          : e.target.value
                      )
                    }
                    label="Field Groups"
                  >
                    {fieldGroups.map((fg) => (
                      <MenuItem key={fg.id} value={fg.id}>
                        {fg.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select field groups to add custom fields</FormHelperText>
                </FormControl>

                {selectedFieldDefinitions.map((field) => (
                  <DynamicFieldRenderer key={field.id} field={field} onChange={updateFieldValue} />
                ))}
              </>
            )}
          </Stack>
        </form>
      </AppDrawer>

      {/* Image Manager Drawer */}
      <AppDrawer
        open={isImageManagerOpen}
        onClose={() => {
          setIsImageManagerOpen(false);
          setManagingImagesProduct(null);
        }}
        title={`Manage Images - ${managingImagesProduct?.name || 'Product'}`}
        width={900}
        footer={
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setIsImageManagerOpen(false);
                setManagingImagesProduct(null);
              }}
            >
              Close
            </Button>
          </Box>
        }
      >
        {!!managingImagesProduct && (
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
      </AppDrawer>
    </Stack>
  );
};

export default ShopProductsPage;
