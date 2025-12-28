import { FC, useState, useEffect, useMemo } from 'react';

import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';
import { useAppSelector } from '@/hooks/useRedux';
import {
  useGetCartQuery,
  useGetUserAddressesQuery,
  useCreateUserAddressMutation,
  useCreateOrderMutation,
  useClearCartMutation,
} from '@/services/apiSlice';
import { CreateAddressInput } from '@/types/common';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

interface CheckoutFormValues extends CreateAddressInput {
  notes?: string;
}

const CheckoutPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { control, handleSubmit } = useForm<CheckoutFormValues>({
    defaultValues: {
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'USA',
      notes: '',
    },
  });

  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ orderNumber: string; total: number } | null>(
    null
  );

  const { data: cartData } = useGetCartQuery();
  const { data: addressesData } = useGetUserAddressesQuery();
  const [createAddress] = useCreateUserAddressMutation();
  const [createOrder, { isLoading: orderLoading }] = useCreateOrderMutation();
  const [clearCart] = useClearCartMutation();

  const cart = cartData?.data;
  const items = useMemo(() => cart?.items || [], [cart?.items]);
  const total = cart?.total || 0;
  const addresses = useMemo(() => addressesData?.data || [], [addressesData?.data]);

  useEffect(() => {
    if (isAuthenticated) {
      if (items.length > 0) {
        // Auto-select first shipping address
        if (addresses.length > 0 && selectedAddress === null) {
          const shippingAddress = addresses.find((addr) => addr.address_type === 'shipping');
          if (shippingAddress) {
            setSelectedAddress(shippingAddress.id);
          }
        }
        return;
      }
      message.info('Your cart is empty');
      navigate('/cart');
      return;
    }
    message.info('Please login to proceed with checkout');
    navigate('/login');
  }, [isAuthenticated, navigate, items, addresses, selectedAddress]);

  const handlePlaceOrder = async (values: CheckoutFormValues) => {
    try {
      let shippingAddressId = selectedAddress;

      // If using new address, create it first
      if (useNewAddress) {
        const addressPayload: CreateAddressInput = {
          address_line1: values.address_line1,
          address_line2: values.address_line2,
          city: values.city,
          state: values.state,
          postal_code: values.postal_code,
          country: values.country || 'USA',
          address_type: 'shipping',
        };
        const addressResponse = await createAddress(addressPayload).unwrap();

        if (addressResponse.data) {
          shippingAddressId = addressResponse.data.id;
        }
      }

      if (shippingAddressId) {
        // Create order
        const orderResponse = await createOrder({
          shipping_address_id: shippingAddressId,
          payment_method: paymentMethod,
          notes: values.notes || '',
        }).unwrap();

        if (orderResponse.data) {
          // Clear cart
          await clearCart('').unwrap();

          // Show success dialog
          setOrderDetails({
            orderNumber: orderResponse.data.order_number,
            total: orderResponse.data.total,
          });
          setSuccessDialogOpen(true);
        }
        return;
      }
      message.error('Please select or enter a shipping address');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to place order');
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate('/dashboard');
  };

  const subtotal = total;
  const shipping = 10; // Flat rate for now
  const tax = subtotal * 0.08; // 8% tax
  const orderTotal = subtotal + shipping + tax;

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon fontSize="large" /> Checkout
        </Typography>

        <form onSubmit={handleSubmit(handlePlaceOrder)}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, lg: 7 }}>
              {/* Shipping Address Section */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon /> Shipping Address
                  </Typography>

                  {addresses.length > 0 && !useNewAddress && (
                    <Stack spacing={2}>
                      <FormControl>
                        <RadioGroup
                          value={selectedAddress}
                          onChange={(e) => setSelectedAddress(Number(e.target.value))}
                        >
                          {addresses.map((address) => (
                            <FormControlLabel
                              key={address.id}
                              value={address.id}
                              control={<Radio />}
                              label={
                                <Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    {address.address_line1}
                                  </Typography>
                                  {address.address_line2 && (
                                    <Typography variant="body2">{address.address_line2}</Typography>
                                  )}
                                  <Typography variant="body2" color="text.secondary">
                                    {address.city}, {address.state} {address.postal_code}
                                  </Typography>
                                </Box>
                              }
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <Button
                        variant="text"
                        onClick={() => setUseNewAddress(true)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        + Add New Address
                      </Button>
                    </Stack>
                  )}

                  {(addresses.length === 0 || useNewAddress) && (
                    <Stack spacing={2}>
                      {addresses.length > 0 && (
                        <Button
                          variant="text"
                          onClick={() => setUseNewAddress(false)}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          ← Use Saved Address
                        </Button>
                      )}

                      <Controller
                        name="address_line1"
                        control={control}
                        rules={{ required: 'Please enter your address' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            label="Address Line 1"
                            placeholder="123 Main St"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            fullWidth
                          />
                        )}
                      />

                      <Controller
                        name="address_line2"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Address Line 2 (Optional)"
                            placeholder="Apt, Suite, Building"
                            fullWidth
                          />
                        )}
                      />

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Controller
                            name="city"
                            control={control}
                            rules={{ required: 'Please enter city' }}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                label="City"
                                placeholder="New York"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Controller
                            name="state"
                            control={control}
                            rules={{ required: 'Please enter state' }}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                label="State"
                                placeholder="NY"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Controller
                            name="postal_code"
                            control={control}
                            rules={{ required: 'Please enter ZIP code' }}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                label="ZIP Code"
                                placeholder="10001"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Controller
                            name="country"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth>
                                <Select {...field} label="Country">
                                  <MenuItem value="USA">United States</MenuItem>
                                  <MenuItem value="Canada">Canada</MenuItem>
                                  <MenuItem value="Mexico">Mexico</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method Section */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCardIcon /> Payment Method
                  </Typography>

                  <FormControl>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <FormControlLabel
                        value="credit_card"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CreditCardIcon fontSize="small" />
                            <Typography>Credit / Debit Card</Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="paypal"
                        control={<Radio />}
                        label="PayPal"
                      />
                      <FormControlLabel
                        value="cash_on_delivery"
                        control={<Radio />}
                        label="Cash on Delivery"
                      />
                    </RadioGroup>
                  </FormControl>

                  {paymentMethod === 'credit_card' && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Payment processing will be integrated with Stripe or PayPal in production. For
                        now, orders will be created with pending payment status.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Order Notes (Optional)
                  </Typography>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={4}
                        placeholder="Add any special instructions for your order..."
                        fullWidth
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Order Summary */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>

                  <Stack spacing={2} sx={{ mb: 2 }}>
                    {items.map((item) => (
                      <Box
                        key={item.product_id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>${subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Shipping:</Typography>
                      <Typography>${shipping.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Tax (8%):</Typography>
                      <Typography>${tax.toFixed(2)}</Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${orderTotal.toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={orderLoading}
                    startIcon={<ShoppingCartIcon />}
                  >
                    Place Order
                  </Button>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                    By placing this order, you agree to our terms and conditions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Container>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={handleSuccessDialogClose}>
        <DialogTitle>Order Placed Successfully!</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              Order Number: <strong>{orderDetails?.orderNumber}</strong>
            </Typography>
            <Typography>
              Total: <strong>${orderDetails?.total.toFixed(2)}</strong>
            </Typography>
            <Typography>We'll send you an email confirmation shortly.</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessDialogClose} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default CheckoutPage;
