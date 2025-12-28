import { FC } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Link, useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import { useAppSelector } from '@/hooks/useRedux';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from '@/services/apiSlice';
import { message } from '@/utils/notification';

const CartPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: cartData, isLoading: loading } = useGetCartQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();

  const cart = cartData?.data;

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    try {
      await updateCartItem({ productId: productId, quantity }).unwrap();
      message.success('Cart updated');
    } catch {
      message.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeFromCart({ productId }).unwrap();
      message.success('Item removed from cart');
    } catch {
      message.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart('cart').unwrap();
      message.success('Cart cleared');
    } catch {
      message.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
      return;
    }
    message.info('Please login to checkout');
    navigate('/login');
  };

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ py: 8, minHeight: 'calc(100vh - 64px - 200px)' }}>
          <EmptyState title="Loading cart..." />
        </Container>
      </AppLayout>
    );
  }

  const hasProducts = cart?.items && cart.items.length > 0;

  if (!hasProducts) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ py: 8, minHeight: 'calc(100vh - 64px - 200px)' }}>
          <EmptyState title="Your cart is empty" description="Start adding products to your cart">
            <Button component={Link} to="/products" variant="contained" startIcon={<ShoppingBagIcon />}>
              Start Shopping
            </Button>
          </EmptyState>
        </Container>
      </AppLayout>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const shipping = 9.99;
  const total = subtotal + tax + shipping;
  const totalItems = cart.items.length;

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 8, minHeight: 'calc(100vh - 64px - 200px)' }}>
        <Stack spacing={1} mb={3}>
          <Typography variant="h3">Shopping Cart</Typography>
          <Typography variant="body1" color="text.secondary">
            {totalItems} items in your cart
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={2}>
              <Typography variant="h5">Products</Typography>

              {cart.items.map((item) => (
                <Card key={item.product_id}>
                  <CardContent>
                    <Grid container spacing={2}>
                      {/* Product Info */}
                      <Grid size={{ xs: 12, md: 7 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            component="img"
                            src={item.image_url || 'https://via.placeholder.com/100'}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/100';
                            }}
                            width={100}
                            height={100}
                            sx={{ objectFit: 'cover', borderRadius: 1 }}
                          />
                          <Stack spacing={0.5}>
                            <Typography
                              component={Link}
                              to={`/products/${item.slug}`}
                              variant="h6"
                              sx={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              by {item.organization_name}
                            </Typography>
                            <Typography variant="body1" color="primary" fontWeight="bold">
                              ${item.price.toFixed(2)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>

                      {/* Quantity and Actions */}
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Stack spacing={1}>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    Quantity
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <TextField
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const value = Number.parseInt(e.target.value);
                                      if (value >= 1) {
                                        handleUpdateQuantity(item.product_id, value);
                                      }
                                    }}
                                    slotProps={{ htmlInput: { min: 1 } }}
                                    size="small"
                                    sx={{ width: 80 }}
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    Total
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="h6" fontWeight="bold">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveItem(item.product_id)}
                            fullWidth
                          >
                            Remove
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outlined" color="error" onClick={handleClearCart}>
                Clear Cart
              </Button>
            </Stack>
          </Grid>

          {/* Order Summary */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ position: 'sticky', top: 80 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Order Summary
                </Typography>

                <Stack spacing={1.5} mb={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1">Subtotal:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${subtotal.toFixed(2)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1">Tax (10%):</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${tax.toFixed(2)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1">Shipping:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${shipping.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" my={2}>
                  <Typography variant="h5">Total:</Typography>
                  <Typography variant="h5" color="primary">
                    ${total.toFixed(2)}
                  </Typography>
                </Stack>

                <Stack spacing={1.5}>
                  <Button variant="contained" size="large" fullWidth onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                  <Button component={Link} to="/products" variant="outlined" fullWidth>
                    Continue Shopping
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
  );
};

export default CartPage;
