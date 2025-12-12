import { Link, useNavigate } from 'react-router';
import {
  Col,
  Typography,
  InputNumber,
  List,
  Empty,
  Divider,
  Space,
  message,
} from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { useAppSelector } from '@/hooks/useRedux';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from '@/services/apiSlice';
import {
  Container,
  LoadingContainer,
  ContentRow,
  CartItemCard,
  ProductImage,
  ProductTitle,
  SmallText,
  BlockText,
  PriceWrapper,
  Price,
  FreePrice,
  RightAlignCol,
  TotalPrice,
  EventTicketsTitle,
  ClearCartButton,
  SummaryCard,
  SummaryRow,
  TotalTitle,
  CheckoutButton,
  ContinueShoppingButton,
} from './styles';

const { Title, Text } = Typography;

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
          <LoadingContainer>
            <Empty description="Loading cart..." />
          </LoadingContainer>
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
              <button type="button" className="ant-btn ant-btn-primary">
                <ShoppingOutlined /> Start Shopping
              </button>
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

        <ContentRow gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Product Items */}
            {hasProducts && (
              <>
                <Title level={4}>Products</Title>
                <List
                  dataSource={cart.items}
                  renderItem={(item) => (
                    <CartItemCard>
                      <ContentRow gutter={16} align="middle">
                        <Col xs={6} sm={4}>
                          <ProductImage
                            src="/placeholder-image.jpg"
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/100';
                            }}
                          />
                        </Col>
                        <Col xs={18} sm={12}>
                          <Link to={`/products/${item.slug}`}>
                            <ProductTitle level={5}>{item.name}</ProductTitle>
                          </Link>
                          <SmallText type="secondary">by {item.organization_name}</SmallText>
                          <PriceWrapper>
                            <Price strong>${Number.parseFloat(item.price).toFixed(2)}</Price>
                          </PriceWrapper>
                        </Col>
                        <Col xs={12} sm={4}>
                          <InputNumber
                            min={1}
                            value={item.quantity}
                            onChange={(value) => handleUpdateQuantity(item.product_id, value || 1)}
                          />
                        </Col>
                        <Col xs={12} sm={4}>
                          <RightAlignCol>
                            <Space direction="vertical" align="end">
                              <TotalPrice strong>
                                ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                              </TotalPrice>
                              <button
                                type="button"
                                className="ant-btn ant-btn-text ant-btn-dangerous"
                                onClick={() => handleRemoveItem(item.product_id)}
                              >
                                <DeleteOutlined /> Remove
                              </button>
                            </Space>
                          </RightAlignCol>
                        </Col>
                      </ContentRow>
                    </CartItemCard>
                  )}
                />
              </>
            )}

            {/* Event Ticket Items */}
            {hasTickets && (
              <>
                <EventTicketsTitle level={4} hasProducts={!!hasProducts}>
                  Event Tickets
                </EventTicketsTitle>
                <List
                  dataSource={cart.eventTicketItems}
                  renderItem={(item) => (
                    <CartItemCard>
                      <ContentRow gutter={16} align="middle">
                        <Col xs={24} sm={12}>
                          <Link to={`/events/${item.event_slug}`}>
                            <ProductTitle level={5}>{item.event_title}</ProductTitle>
                          </Link>
                          <BlockText type="secondary">{item.ticket_type}</BlockText>
                          {item.start_date && (
                            <BlockText type="secondary">
                              {new Date(item.start_date).toLocaleDateString()}
                            </BlockText>
                          )}
                          {item.venue_name && (
                            <BlockText type="secondary">{item.venue_name}</BlockText>
                          )}
                          <PriceWrapper>
                            {item.is_free ? (
                              <FreePrice strong>FREE</FreePrice>
                            ) : (
                              <Price strong>${Number.parseFloat(item.price).toFixed(2)}</Price>
                            )}
                          </PriceWrapper>
                        </Col>
                        <Col xs={12} sm={6}>
                          <SmallText type="secondary">Quantity</SmallText>
                          <div>
                            <Text strong>{item.quantity}</Text>
                          </div>
                          <SmallText type="secondary">
                            {item.quantity_available - item.quantity_sold} available
                          </SmallText>
                        </Col>
                        <Col xs={12} sm={6}>
                          <RightAlignCol>
                            <Space direction="vertical" align="end">
                              <TotalPrice strong>
                                {item.is_free
                                  ? 'FREE'
                                  : `$${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}`}
                              </TotalPrice>
                              <button type="button" className="ant-btn ant-btn-text ant-btn-dangerous">
                                <DeleteOutlined /> Remove
                              </button>
                            </Space>
                          </RightAlignCol>
                        </Col>
                      </ContentRow>
                    </CartItemCard>
                  )}
                />
              </>
            )}

            <ClearCartButton danger onClick={handleClearCart}>
              Clear Cart
            </ClearCartButton>
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
                <TotalTitle level={4}>${total.toFixed(2)}</TotalTitle>
              </SummaryRow>
              <CheckoutButton type="primary" size="large" block onClick={handleCheckout}>
                Proceed to Checkout
              </CheckoutButton>
              <Link to="/products">
                <ContinueShoppingButton block>Continue Shopping</ContinueShoppingButton>
              </Link>
            </SummaryCard>
          </Col>
        </ContentRow>
      </Container>
    </Layout>
  );
};
