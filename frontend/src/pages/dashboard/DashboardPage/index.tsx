import { FC, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Box,
  Container,
  CardActions,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';
import { useConfirm } from '@/components/ConfirmDialog';
import { useAppSelector } from '@/hooks/useRedux';
import {
  useGetMyOrganizationsQuery,
  useCreateOrganizationMutation,
  useDeleteOrganizationMutation,
} from '@/services/apiSlice';
import { Organization } from '@/types/common';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

interface CreateShopFormValues {
  name: string;
  slug: string;
  description?: string;
}

const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { confirm } = useConfirm();

  const { control, handleSubmit, reset } = useForm<CreateShopFormValues>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const { data: organizationsData, refetch } = useGetMyOrganizationsQuery();
  const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation();
  const [deleteOrganization, { isLoading: isDeleting }] = useDeleteOrganizationMutation();

  const organizations = organizationsData?.data || [];

  const handleCreateShop = async (values: CreateShopFormValues) => {
    try {
      await createOrganization(values).unwrap();
      message.success('Shop created successfully!');
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to create shop');
    }
  };

  const handleDelete = (org: Organization) => {
    confirm({
      title: 'Delete Shop',
      content: (
        <Stack spacing={2}>
          <Typography>
            Are you sure you want to delete <strong>{org.name}</strong>?
          </Typography>
          <Typography color="error">
            This action cannot be undone. All shop data including products, custom fields, and
            themes will be permanently deleted.
          </Typography>
        </Stack>
      ),
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteOrganization(org.id).unwrap();
          message.success('Shop deleted successfully');
          refetch();
        } catch (error) {
          message.error(getErrorMessage(error) || 'Failed to delete shop');
        }
      },
    });
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" gutterBottom>
            Welcome back, {user?.first_name || user?.email}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your shops and products from your dashboard
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsModalOpen(true)}
              >
                Create New Shop
              </Button>
            </Box>

            {organizations.length > 0 ? (
              <Grid container spacing={2}>
                {organizations.map((org) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={org.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {org.banner_url ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={org.banner_url}
                          alt={org.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                          }}
                        >
                          <StorefrontIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {org.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {org.description || 'No description'}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Stack direction="row" spacing={1} sx={{ width: '100%', flexWrap: 'wrap' }}>
                          <Button size="small" onClick={() => navigate(`/dashboard/shop/${org.id}`)}>
                            Manage
                          </Button>
                          <Button size="small" onClick={() => navigate(`/shop/${org.slug}`)}>
                            View Shop
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(org)}
                            disabled={isDeleting}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                You don't have any shops yet. Create one to get started!
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Create Shop Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Shop</DialogTitle>
        <form onSubmit={handleSubmit(handleCreateShop)}>
          <DialogContent>
            <Stack spacing={3}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Please enter shop name' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Shop Name"
                    placeholder="e.g., My Art Studio"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="slug"
                control={control}
                rules={{
                  required: 'Please enter shop URL',
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Only lowercase letters, numbers, and hyphens',
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Shop URL"
                    placeholder="e.g., my-art-studio"
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
                    placeholder="Tell customers about your shop..."
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isCreating}>
              Create Shop
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </AppLayout>
  );
};

export default DashboardPage;
