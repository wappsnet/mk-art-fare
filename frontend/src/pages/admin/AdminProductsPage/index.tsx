import { FC, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router';

import AppDataTable, { Column } from '@/components/AppDataTable';
import AppLayout from '@/components/AppLayout';
import { useGetProductsQuery, useModerateProductMutation } from '@/services/apiSlice';
import { Product } from '@/types/common';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

const AdminProductsPage: FC = () => {
  const navigate = useNavigate();
  const [moderationModal, setModerationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  const { data: productsData, isLoading, refetch } = useGetProductsQuery({});
  const [moderateProduct, { isLoading: isModerating }] = useModerateProductMutation();

  const products = productsData?.data?.products || [];

  const handleModerate = async (productId: number, status: 'approved' | 'declined') => {
    try {
      await moderateProduct({
        id: productId,
        status,
        note: moderationNote,
      }).unwrap();

      message.success(`Product ${status === 'approved' ? 'approved' : 'declined'} successfully`);
      setModerationModal(false);
      setModerationNote('');
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to moderate product');
    }
  };

  const openModerationModal = (product: Product) => {
    setSelectedProduct(product);
    setModerationModal(true);
  };

  const getModerationStatusColor = (
    status: string
  ): 'default' | 'warning' | 'success' | 'error' => {
    const colorMap: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
      pending: 'warning',
      approved: 'success',
      declined: 'error',
    };
    return colorMap[status] || 'default';
  };

  const columns: Column<Product>[] = [
    {
      id: 'id',
      label: 'ID',
      render: (product) => <Typography variant="body2">{product.id}</Typography>,
    },
    {
      id: 'image',
      label: 'Image',
      render: (product) => (
        <Box
          component="img"
          src={product.primary_image_url || 'https://via.placeholder.com/80'}
          alt="Product"
          sx={{
            width: 60,
            height: 60,
            objectFit: 'cover',
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      id: 'name',
      label: 'Product Name',
      render: (product) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {product.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {product.sku}
            </Typography>
          </Box>
          {product.moderation_status === 'approved' && (
            <VerifiedUserIcon sx={{ color: 'success.main', fontSize: 16 }} />
          )}
        </Stack>
      ),
    },
    {
      id: 'price',
      label: 'Price',
      render: (product) => (
        <Typography variant="body2">${product.price?.toFixed(2) || '0.00'}</Typography>
      ),
    },
    {
      id: 'stock',
      label: 'Stock',
      render: (product) => (
        <Chip
          label={
            (product.stock_quantity || 0) > 0
              ? `${product.stock_quantity} in stock`
              : 'Out of stock'
          }
          color={(product.stock_quantity || 0) > 0 ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (product) => (
        <Chip
          label={(product.moderation_status || 'pending').toUpperCase()}
          color={getModerationStatusColor(product.moderation_status || 'pending')}
          size="small"
        />
      ),
    },
    {
      id: 'created',
      label: 'Created',
      render: (product) => (
        <Typography variant="body2">{dayjs(product.created_at).format('MMM DD, YYYY')}</Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (product) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/products/${product.slug}`)}
          >
            View
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => openModerationModal(product)}
            disabled={product.moderation_status === 'approved'}
          >
            Moderate
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <AppLayout>
      <Box sx={{ py: 4, px: 3 }}>
        <Stack spacing={4}>
          {/* Breadcrumbs */}
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <MuiLink
              component={Link}
              to="/admin"
              underline="hover"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <HomeIcon fontSize="small" />
              Admin Dashboard
            </MuiLink>
            <Typography
              color="text.primary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ShoppingBagIcon fontSize="small" />
              Product Moderation
            </Typography>
          </Breadcrumbs>

          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <ShoppingBagIcon /> Product Moderation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and moderate product listings
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <AppDataTable
                columns={columns}
                data={products}
                isLoading={isLoading}
                getRowKey={(product) => product.id}
                emptyContent={<Typography color="text.secondary">No products found</Typography>}
              />
            </CardContent>
          </Card>

          <Dialog
            open={moderationModal}
            onClose={() => {
              setModerationModal(false);
              setModerationNote('');
              setSelectedProduct(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Moderate Product</DialogTitle>
            <DialogContent>
              {selectedProduct && (
                <Stack spacing={3} sx={{ mt: 2 }}>
                  {selectedProduct.primary_image_url && (
                    <Box
                      component="img"
                      src={selectedProduct.primary_image_url}
                      alt={selectedProduct.name}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 2,
                      }}
                    />
                  )}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {selectedProduct.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedProduct.description}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Price:
                        </Typography>
                        <Typography variant="body2">
                          ${(selectedProduct.price || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          SKU:
                        </Typography>
                        <Typography variant="body2">{selectedProduct.sku}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Moderation Note (Optional):
                    </Typography>
                    <TextField
                      multiline
                      rows={4}
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                      placeholder="Add a note about this moderation decision..."
                      fullWidth
                    />
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => selectedProduct && handleModerate(selectedProduct.id, 'declined')}
                disabled={isModerating}
              >
                Decline
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={() => selectedProduct && handleModerate(selectedProduct.id, 'approved')}
                disabled={isModerating}
              >
                Approve
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Box>
    </AppLayout>
  );
};

export default AdminProductsPage;
