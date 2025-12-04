import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
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
import styled from '@emotion/styled';
import { Layout } from '../components/Layout';
import { useAppSelector } from '../hooks/useRedux';
import {
  useGetCartQuery,
  useGetUserAddressesQuery,
  useCreateUserAddressMutation,
  useCreateOrderMutation,
  useClearCartMutation,
} from '@/services/apiSlice';

const { Title, Text } = Typography;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

const SummaryCard = styled(Card)`
  position: sticky;
  top: 80px;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

interface Address {
  id: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: string;
}

export const CheckoutPage = () => {
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
  const items = cart?.items || [];
  const total = cart?.total || 0;
  const addresses = addressesData?.data || [];

  useEffect(() => {
    if (!isAuthenticated) {
      message.info('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      message.info('Your cart is empty');
      navigate('/cart');
      return;
    }

    // Auto-select first shipping address
    if (addresses.length > 0 && !selectedAddress) {
      const shippingAddress = addresses.find((addr) => addr.address_type === 'shipping');
      if (shippingAddress) {
        setSelectedAddress(shippingAddress.id);
      }
    }
  }, [isAuthenticated, navigate, items, addresses, selectedAddress]);

  const handlePlaceOrder = async (values: any) => {
    try {
      let shippingAddressId = selectedAddress;

      // If using new address, create it first
      if (useNewAddress) {
        const addressResponse = await createAddress({
          address_line1: values.address_line1,
          address_line2: values.address_line2,
          city: values.city,
          state: values.state,
          postal_code: values.postal_code,
          country: values.country || 'USA',
          address_type: 'shipping',
        }).unwrap();

        if (addressResponse.data) {
          shippingAddressId = addressResponse.data.id;
        }
      }

      if (!shippingAddressId) {
        message.error('Please select or enter a shipping address');
        return;
      }

      // Create order
      const orderResponse = await createOrder({
        shipping_address_id: shippingAddressId,
        payment_method: paymentMethod,
        notes: values.notes,
      }).unwrap();

      if (orderResponse.data) {
        // Clear cart
        await clearCart().unwrap();

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
    } catch (error: any) {
      message.error(error.message || 'Failed to place order');
    }
  };

  const subtotal = total;
  const shipping = 10.0; // Flat rate for now
  const tax = subtotal * 0.08; // 8% tax
  const orderTotal = subtotal + shipping + tax;

  return (
    <Layout>
      <Container>
        <Title level={2} style={{ marginBottom: 32 }}>
          <ShoppingOutlined /> Checkout
        </Title>

        <Form form={form} layout="vertical" onFinish={handlePlaceOrder}>
          <Row gutter={[48, 24]}>
            <Col xs={24} lg={14}>
              {/* Shipping Address Section */}
              <Card
                title={
                  <>
                    <EnvironmentOutlined /> Shipping Address
                  </>
                }
                style={{ marginBottom: 24 }}
              >
                {addresses.length > 0 && !useNewAddress && (
                  <>
                    <Radio.Group
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
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
                    </Radio.Group>
                    <Button
                      type="link"
                      onClick={() => setUseNewAddress(true)}
                      style={{ marginTop: 16, padding: 0 }}
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
                        style={{ marginBottom: 16, padding: 0 }}
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
              </Card>

              {/* Payment Method Section */}
              <Card
                title={
                  <>
                    <CreditCardOutlined /> Payment Method
                  </>
                }
                style={{ marginBottom: 24 }}
              >
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
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
                </Radio.Group>

                {paymentMethod === 'credit_card' && (
                  <div
                    style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 4 }}
                  >
                    <Text type="secondary">
                      Payment processing will be integrated with Stripe or PayPal in production. For
                      now, orders will be created with pending payment status.
                    </Text>
                  </div>
                )}
              </Card>

              {/* Order Notes */}
              <Card title="Order Notes (Optional)">
                <Form.Item name="notes">
                  <Input.TextArea
                    rows={4}
                    placeholder="Add any special instructions for your order..."
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Order Summary */}
            <Col xs={24} lg={10}>
              <SummaryCard title="Order Summary">
                <div style={{ marginBottom: 24 }}>
                  {items.map((item) => (
                    <CartItem key={item.product_id}>
                      <div>
                        <Text strong>{item.name}</Text>
                        <br />
                        <Text type="secondary">Quantity: {item.quantity}</Text>
                      </div>
                      <Text>${(parseFloat(item.price) * item.quantity).toFixed(2)}</Text>
                    </CartItem>
                  ))}
                </div>

                <Divider />

                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Subtotal:</Text>
                    <Text>${subtotal.toFixed(2)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Shipping:</Text>
                    <Text>${shipping.toFixed(2)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Tax (8%):</Text>
                    <Text>${tax.toFixed(2)}</Text>
                  </div>
                </Space>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    Total:
                  </Title>
                  <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    ${orderTotal.toFixed(2)}
                  </Title>
                </div>

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

                <Text type="secondary" style={{ display: 'block', marginTop: 16, fontSize: 12 }}>
                  By placing this order, you agree to our terms and conditions.
                </Text>
              </SummaryCard>
            </Col>
          </Row>
        </Form>
      </Container>
    </Layout>
  );
};
