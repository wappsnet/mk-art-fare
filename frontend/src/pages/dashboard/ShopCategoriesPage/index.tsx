import { FC, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'react-router';

import AppDataTable, { Column } from '@/components/AppDataTable';
import { useConfirm } from '@/components/ConfirmDialog';
import {
  useGetOrganizationCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/services/apiSlice';
import { Category } from '@/types/common';
import { getErrorMessage } from '@/types/errors.ts';
import { message } from '@/utils/notification';

interface CategoryFormValues {
  name: string;
  description?: string;
}

const ShopCategoriesPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { confirm } = useConfirm();

  const { control, handleSubmit, reset, setValue } = useForm<CategoryFormValues>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { data: categoriesData } = useGetOrganizationCategoriesQuery(orgId);
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const allCategories = categoriesData?.data || [];

  const openCategoryModal = (category?: Category) => {
    setEditingCategory(category || null);
    if (category) {
      setValue('name', category.name);
      setValue('description', category.description || '');
    } else {
      reset();
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (values: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data: values }).unwrap();
        message.success('Category updated successfully!');
      } else {
        await createCategory({ organization_id: orgId, ...values }).unwrap();
        message.success('Category created successfully!');
      }
      setIsCategoryModalOpen(false);
      reset();
    } catch (error) {
      message.error(
        getErrorMessage(error) || `Failed to ${editingCategory ? 'update' : 'create'} category`
      );
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteCategory(categoryId).unwrap();
      message.success('Category deleted successfully!');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to delete category');
    }
  };

  const confirmDelete = (category: Category) => {
    confirm({
      title: 'Delete Category',
      content: 'Are you sure you want to delete this category?',
      onConfirm: () => handleDeleteCategory(category.id),
    });
  };

  const columns: Column<Category>[] = [
    {
      id: 'name',
      label: 'Name',
      render: (category) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">{category.name}</Typography>
          <Chip
            label={category.organization_id ? 'Custom' : 'Global'}
            color={category.organization_id ? 'success' : 'primary'}
            size="small"
          />
        </Stack>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (category) => <Typography variant="body2">{category.description}</Typography>,
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (category) =>
        category.organization_id ? (
          <Stack direction="row" spacing={1}>
            <IconButton size="small" color="primary" onClick={() => openCategoryModal(category)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => confirmDelete(category)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Global category
          </Typography>
        ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openCategoryModal()}
          sx={{ mb: 2 }}
        >
          Create Custom Category
        </Button>
        <Typography variant="body2" color="text.secondary">
          You can use global categories (blue tags) or create shop-specific categories (green tags)
        </Typography>
      </Box>

      <AppDataTable
        columns={columns}
        data={allCategories}
        getRowKey={(category) => category.id}
        emptyContent={<Typography color="text.secondary">No categories found</Typography>}
      />

      {/* Category Dialog */}
      <Dialog
        open={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          reset();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
        <form onSubmit={handleSubmit(handleCategorySubmit)}>
          <DialogContent>
            <Stack spacing={3}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Category name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Category Name"
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
                  <TextField
                    {...field}
                    label="Description"
                    multiline
                    rows={3}
                    fullWidth
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setIsCategoryModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isCreating || isUpdating}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
};

export default ShopCategoriesPage;
