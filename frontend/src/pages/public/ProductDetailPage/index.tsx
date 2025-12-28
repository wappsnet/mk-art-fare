import { FC, useState } from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  Container,
  Grid,
  Typography,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Box,
  Stack,
  TextField,
} from '@mui/material';
import { useParams, Link } from 'react-router';

import AppLayout from '@/components/AppLayout';
import { useGetProductQuery, useAddToCartMutation } from '@/services/apiSlice';
import { message } from '@/utils/notification';

import ProductImageGallery from './Addons/components/ProductImageGallery';

const LoadingState: FC = () => (
  <AppLayout>
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <CircularProgress size={60} />
      </Box>
    </Container>
  </AppLayout>
);

const NotFoundState: FC = () => (
  <AppLayout>
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4">Product not found</Typography>
    </Container>
  </AppLayout>
);

const ProductDetailPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: productData, isLoading: loading } = useGetProductQuery(slug || '', {
    skip: !slug,
  });
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();

  const product = productData?.data;

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({ productId: product.id, quantity }).unwrap();
      message.success('Added to cart!');
    } catch {
      message.error('Failed to add to cart');
    }
  };

  if (loading) return <LoadingState />;
  if (!product) return <NotFoundState />;

  const images = product.images || [];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const isInStock = product.stock_quantity > 0;

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Home
          </MuiLink>
          <MuiLink component={Link} to="/products" underline="hover" color="inherit">
            Products
          </MuiLink>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={6}>
          {/* Image Gallery */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ProductImageGallery
              images={images}
              selectedIndex={selectedImageIndex}
              onSelectImage={setSelectedImageIndex}
              productName={product.name}
            />
          </Grid>

          {/* Product Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              {/* Shop Link */}
              <Button
                component={Link}
                to={`/shop/${product.organization_slug}`}
                startIcon={<StorefrontIcon />}
                sx={{ alignSelf: 'flex-start', p: 0 }}
                variant="text"
              >
                {product.organization_name || 'Unknown Artist'}
              </Button>

              {/* Product Name */}
              <Typography variant="h3">{product.name}</Typography>

              {/* SKU */}
              {product.sku && (
                <Typography variant="body2" color="text.secondary">
                  SKU: {product.sku}
                </Typography>
              )}

              {/* Price Section */}
              <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2 }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="h3" color="primary" component="span" fontWeight="bold">
                      ${product.price.toFixed(2)}
                    </Typography>
                    {hasDiscount && (
                      <Typography
                        variant="h5"
                        component="span"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through', ml: 2 }}
                      >
                        ${product.compare_at_price!.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={isInStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
                    color={isInStock ? 'success' : 'error'}
                    size="small"
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Description */}
              {product.description && (
                <>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">{product.description}</Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Quantity Selector */}
              <Box>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  Quantity:
                </Typography>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value);
                    if (value >= 1 && value <= product.stock_quantity) {
                      setQuantity(value);
                    }
                  }}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: product.stock_quantity,
                    },
                  }}
                  sx={{ width: 120 }}
                />
              </Box>

              {/* Add to Cart Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={!isInStock || adding}
                fullWidth
              >
                {isInStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
  );
};

export default ProductDetailPage;
