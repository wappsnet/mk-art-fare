import { Link, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  InputNumber,
  List,
  Empty,
  Divider,
  Space,
  message,
} from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { Layout } from '@/components/Layout';
import { useAppSelector } from '@/hooks/useRedux';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from '@/services/apiSlice';

const { Title, Text } = Typography;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

const CartItemCard = styled(Card)`
  margin-bottom: 16px;

  .ant-card-body {
    padding: 16px;
  }
`;

const ProductImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
`;

const SummaryCard = styled(Card)`
  position: sticky;
  top: 80px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const CartPage = () => {
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
    if (!isAuthenticated) {
      message.info('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Empty description="Loading cart..." />
          </div>
        </Container>
      </Layout>
    );
  }

  const hasProducts = cart?.items && cart.items.length > 0;
  const hasTickets = cart?.eventTicketItems && cart.eventTicketItems.length > 0;

  if (!cart || (!hasProducts && !hasTickets)) {
    return (
      <Layout>
        <Container>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Your cart is empty">
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />}>
                Start Shopping
              </Button>
            </Link>
          </Empty>
        </Container>
      </Layout>
    );
  }

  const productSubtotal = cart.items.reduce(
    (sum, item) => sum + Number.parseFloat(item.price) * item.quantity,
    0
  );
  const ticketSubtotal =
    cart.eventTicketItems?.reduce(
      (sum, item) => sum + Number.parseFloat(item.price) * item.quantity,
      0
    ) || 0;
  const subtotal = productSubtotal + ticketSubtotal;
  const tax = productSubtotal * 0.1; // Tax only on products
  const shipping = hasProducts ? 9.99 : 0; // Shipping only for products
  const total = subtotal + tax + shipping;

  const totalItems = cart.items.length + (cart.eventTicketItems?.length || 0);

  return (
    <Layout>
      <Container>
        <Title level={2}>Shopping Cart</Title>
        <Text type="secondary">{totalItems} items in your cart</Text>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            {/* Product Items */}
            {hasProducts && (
              <>
                <Title level={4}>Products</Title>
                <List
                  dataSource={cart.items}
                  renderItem={(item) => (
                    <CartItemCard>
                      <Row gutter={16} align="middle">
                        <Col xs={6} sm={4}>
                          <ProductImage
                            src="/placeholder-image.jpg"
                            alt={item.name}
                            onError={(e: any) => {
                              e.target.src = 'https://via.placeholder.com/100';
                            }}
                          />
                        </Col>
                        <Col xs={18} sm={12}>
                          <Link to={`/products/${item.slug}`}>
                            <Title level={5} style={{ marginBottom: 4 }}>
                              {item.name}
                            </Title>
                          </Link>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            by {item.organization_name}
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                              ${Number.parseFloat(item.price).toFixed(2)}
                            </Text>
                          </div>
                        </Col>
                        <Col xs={12} sm={4}>
                          <InputNumber
                            min={1}
                            value={item.quantity}
                            onChange={(value) => handleUpdateQuantity(item.product_id, value || 1)}
                          />
                        </Col>
                        <Col xs={12} sm={4} style={{ textAlign: 'right' }}>
                          <Space direction="vertical" align="end">
                            <Text strong style={{ fontSize: 18 }}>
                              ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                            </Text>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveItem(item.product_id)}
                            >
                              Remove
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </CartItemCard>
                  )}
                />
              </>
            )}

            {/* Event Ticket Items */}
            {hasTickets && (
              <>
                <Title level={4} style={{ marginTop: hasProducts ? 32 : 0 }}>
                  Event Tickets
                </Title>
                <List
                  dataSource={cart.eventTicketItems}
                  renderItem={(item) => (
                    <CartItemCard>
                      <Row gutter={16} align="middle">
                        <Col xs={24} sm={12}>
                          <Link to={`/events/${item.event_slug}`}>
                            <Title level={5} style={{ marginBottom: 4 }}>
                              {item.event_title}
                            </Title>
                          </Link>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                            {item.ticket_type}
                          </Text>
                          {item.start_date && (
                            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                              {new Date(item.start_date).toLocaleDateString()}
                            </Text>
                          )}
                          {item.venue_name && (
                            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                              {item.venue_name}
                            </Text>
                          )}
                          <div style={{ marginTop: 8 }}>
                            <Text
                              strong
                              style={{
                                fontSize: 16,
                                color: item.is_free ? '#52c41a' : '#1890ff',
                              }}
                            >
                              {item.is_free
                                ? 'FREE'
                                : `$${Number.parseFloat(item.price).toFixed(2)}`}
                            </Text>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Quantity
                          </Text>
                          <div>
                            <Text strong>{item.quantity}</Text>
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.quantity_available - item.quantity_sold} available
                          </Text>
                        </Col>
                        <Col xs={12} sm={6} style={{ textAlign: 'right' }}>
                          <Space direction="vertical" align="end">
                            <Text strong style={{ fontSize: 18 }}>
                              {item.is_free
                                ? 'FREE'
                                : `$${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}`}
                            </Text>
                            <Button type="text" danger icon={<DeleteOutlined />}>
                              Remove
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </CartItemCard>
                  )}
                />
              </>
            )}

            <Button danger onClick={handleClearCart} style={{ marginTop: 16 }}>
              Clear Cart
            </Button>
          </Col>

          <Col xs={24} lg={8}>
            <SummaryCard title="Order Summary">
              {hasProducts && (
                <SummaryRow>
                  <Text>Products:</Text>
                  <Text strong>${productSubtotal.toFixed(2)}</Text>
                </SummaryRow>
              )}
              {hasTickets && (
                <SummaryRow>
                  <Text>Event Tickets:</Text>
                  <Text strong>${ticketSubtotal.toFixed(2)}</Text>
                </SummaryRow>
              )}
              <SummaryRow>
                <Text>Subtotal:</Text>
                <Text strong>${subtotal.toFixed(2)}</Text>
              </SummaryRow>
              {hasProducts && (
                <>
                  <SummaryRow>
                    <Text>Tax (10%):</Text>
                    <Text strong>${tax.toFixed(2)}</Text>
                  </SummaryRow>
                  <SummaryRow>
                    <Text>Shipping:</Text>
                    <Text strong>${shipping.toFixed(2)}</Text>
                  </SummaryRow>
                </>
              )}
              <Divider />
              <SummaryRow>
                <Title level={4}>Total:</Title>
                <Title level={4} style={{ color: '#1890ff' }}>
                  ${total.toFixed(2)}
                </Title>
              </SummaryRow>
              <Button
                type="primary"
                size="large"
                block
                onClick={handleCheckout}
                style={{ marginTop: 24 }}
              >
                Proceed to Checkout
              </Button>
              <Link to="/products">
                <Button block style={{ marginTop: 12 }}>
                  Continue Shopping
                </Button>
              </Link>
            </SummaryCard>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};
