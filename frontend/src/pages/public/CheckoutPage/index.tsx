import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Radio,
  Divider,
  message,
  Select,
  Space,
  Modal,
} from 'antd';
import { CreditCardOutlined, EnvironmentOutlined, ShoppingOutlined } from '@ant-design/icons';
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
import {
  ContainerStyled,
  PageTitleStyled,
  SectionCardStyled,
  SummaryCardStyled,
  CartItemStyled,
  FullWidthRadioGroupStyled,
  FullWidthSpaceStyled,
  PaymentNoticeStyled,
  CartItemsContainerStyled,
  PriceRowStyled,
  TotalRowStyled,
  TotalLabelStyled,
  TotalAmountStyled,
  TermsTextStyled,
} from './styles';

const { Text } = Typography;

interface CheckoutFormValues extends CreateAddressInput {
  notes?: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

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

          // Show success modal
          Modal.success({
            title: 'Order Placed Successfully!',
            content: (
              <div>
                <p>
                  Order Number: <strong>{orderResponse.data.order_number}</strong>
                </p>
                <p>
                  Total: <strong>${orderResponse.data.total.toFixed(2)}</strong>
                </p>
                <p>We'll send you an email confirmation shortly.</p>
              </div>
            ),
            onOk: () => navigate('/dashboard'),
          });
        }
        return;
      }
      message.error('Please select or enter a shipping address');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to place order');
    }
  };

  const subtotal = total;
  const shipping = 10; // Flat rate for now
  const tax = subtotal * 0.08; // 8% tax
  const orderTotal = subtotal + shipping + tax;

  return (
    <AppLayout>
      <ContainerStyled>
        <PageTitleStyled level={2}>
          <ShoppingOutlined /> Checkout
        </PageTitleStyled>

        <Form form={form} layout="vertical" onFinish={handlePlaceOrder}>
          <Row gutter={[48, 24]}>
            <Col xs={24} lg={14}>
              {/* Shipping Address Section */}
              <SectionCardStyled
                title={
                  <>
                    <EnvironmentOutlined /> Shipping Address
                  </>
                }
              >
                {addresses.length > 0 && !useNewAddress && (
                  <>
                    <FullWidthRadioGroupStyled>
                      <Radio.Group
                        value={selectedAddress}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                      >
                        <FullWidthSpaceStyled>
                          <Space direction="vertical" css={{ width: '100%' }}>
                            {addresses.map((address) => (
                              <Radio key={address.id} value={address.id}>
                                <div>
                                  <Text strong>{address.address_line1}</Text>
                                  {address.address_line2 && <Text>, {address.address_line2}</Text>}
                                  <br />
                                  <Text type="secondary">
                                    {address.city}, {address.state} {address.postal_code}
                                  </Text>
                                </div>
                              </Radio>
                            ))}
                          </Space>
                        </FullWidthSpaceStyled>
                      </Radio.Group>
                    </FullWidthRadioGroupStyled>
                    <Button
                      type="link"
                      onClick={() => setUseNewAddress(true)}
                      css={{ marginTop: 16, padding: 0 }}
                    >
                      + Add New Address
                    </Button>
                  </>
                )}

                {(addresses.length === 0 || useNewAddress) && (
                  <>
                    {addresses.length > 0 && (
                      <Button
                        type="link"
                        onClick={() => setUseNewAddress(false)}
                        css={{ marginBottom: 16, padding: 0 }}
                      >
                        ← Use Saved Address
                      </Button>
                    )}

                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="address_line1"
                          label="Address Line 1"
                          rules={[{ required: true, message: 'Please enter your address' }]}
                        >
                          <Input placeholder="123 Main St" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="address_line2" label="Address Line 2 (Optional)">
                          <Input placeholder="Apt, Suite, Building" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="city"
                          label="City"
                          rules={[{ required: true, message: 'Please enter city' }]}
                        >
                          <Input placeholder="New York" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          name="state"
                          label="State"
                          rules={[{ required: true, message: 'Please enter state' }]}
                        >
                          <Input placeholder="NY" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          name="postal_code"
                          label="ZIP Code"
                          rules={[{ required: true, message: 'Please enter ZIP code' }]}
                        >
                          <Input placeholder="10001" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="country" label="Country" initialValue="USA">
                          <Select>
                            <Select.Option value="USA">United States</Select.Option>
                            <Select.Option value="Canada">Canada</Select.Option>
                            <Select.Option value="Mexico">Mexico</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}
              </SectionCardStyled>

              {/* Payment Method Section */}
              <SectionCardStyled
                title={
                  <>
                    <CreditCardOutlined /> Payment Method
                  </>
                }
              >
                <FullWidthRadioGroupStyled>
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <FullWidthSpaceStyled>
                      <Space direction="vertical" css={{ width: '100%' }}>
                        <Radio value="credit_card">
                          <Space>
                            <CreditCardOutlined />
                            <Text>Credit / Debit Card</Text>
                          </Space>
                        </Radio>
                        <Radio value="paypal">
                          <Space>
                            <Text>PayPal</Text>
                          </Space>
                        </Radio>
                        <Radio value="cash_on_delivery">
                          <Space>
                            <Text>Cash on Delivery</Text>
                          </Space>
                        </Radio>
                      </Space>
                    </FullWidthSpaceStyled>
                  </Radio.Group>
                </FullWidthRadioGroupStyled>

                {paymentMethod === 'credit_card' && (
                  <PaymentNoticeStyled>
                    <Text type="secondary">
                      Payment processing will be integrated with Stripe or PayPal in production. For
                      now, orders will be created with pending payment status.
                    </Text>
                  </PaymentNoticeStyled>
                )}
              </SectionCardStyled>

              {/* Order Notes */}
              <SectionCardStyled title="Order Notes (Optional)">
                <Form.Item name="notes">
                  <Input.TextArea
                    rows={4}
                    placeholder="Add any special instructions for your order..."
                  />
                </Form.Item>
              </SectionCardStyled>
            </Col>

            {/* Order Summary */}
            <Col xs={24} lg={10}>
              <SummaryCardStyled title="Order Summary">
                <CartItemsContainerStyled>
                  {items.map((item) => (
                    <CartItemStyled key={item.product_id}>
                      <div>
                        <Text strong>{item.name}</Text>
                        <br />
                        <Text type="secondary">Quantity: {item.quantity}</Text>
                      </div>
                      <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                    </CartItemStyled>
                  ))}
                </CartItemsContainerStyled>

                <Divider />

                <Space direction="vertical" css={{ width: '100%' }}>
                  <PriceRowStyled>
                    <Text>Subtotal:</Text>
                    <Text>${subtotal.toFixed(2)}</Text>
                  </PriceRowStyled>
                  <PriceRowStyled>
                    <Text>Shipping:</Text>
                    <Text>${shipping.toFixed(2)}</Text>
                  </PriceRowStyled>
                  <PriceRowStyled>
                    <Text>Tax (8%):</Text>
                    <Text>${tax.toFixed(2)}</Text>
                  </PriceRowStyled>
                </Space>

                <Divider />

                <TotalRowStyled>
                  <TotalLabelStyled level={4}>Total:</TotalLabelStyled>
                  <TotalAmountStyled level={4}>${orderTotal.toFixed(2)}</TotalAmountStyled>
                </TotalRowStyled>

                <Button
                  type="primary"
                  size="large"
                  block
                  htmlType="submit"
                  loading={orderLoading}
                  icon={<ShoppingOutlined />}
                >
                  Place Order
                </Button>

                <TermsTextStyled type="secondary">
                  By placing this order, you agree to our terms and conditions.
                </TermsTextStyled>
              </SummaryCardStyled>
            </Col>
          </Row>
        </Form>
      </ContainerStyled>
    </AppLayout>
  );
};

export default CheckoutPage;
