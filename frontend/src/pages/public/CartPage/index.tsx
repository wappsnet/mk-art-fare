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
  Button,
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
  ContainerStyled,
  LoadingContainerStyled,
  ContentRowStyled,
  CartItemCardStyled,
  ProductImageStyled,
  ProductTitle,
  SmallText,
  PriceWrapperStyled,
  Price,
  RightAlignColStyled,
  TotalPrice,
  ClearCartButtonStyled,
  SummaryCardStyled,
  SummaryRowStyled,
  TotalTitle,
  CheckoutButtonStyled,
  ContinueShoppingButtonStyled,
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
        <ContainerStyled>
          <LoadingContainerStyled>
            <Empty description="Loading cart..." />
          </LoadingContainerStyled>
        </ContainerStyled>
      </Layout>
    );
  }

  const hasProducts = cart?.items && cart.items.length > 0;

  if (!cart || !hasProducts) {
    return (
      <Layout>
        <ContainerStyled>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Your cart is empty">
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />}>
                Start Shopping
              </Button>
            </Link>
          </Empty>
        </ContainerStyled>
      </Layout>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number.parseFloat(item.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = 9.99;
  const total = subtotal + tax + shipping;

  const totalItems = cart.items.length;

  return (
    <Layout>
      <ContainerStyled>
        <Title level={2}>Shopping Cart</Title>
        <Text type="secondary">{totalItems} items in your cart</Text>

        <ContentRowStyled gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Title level={4}>Products</Title>
            <List
              dataSource={cart.items}
              renderItem={(item) => (
                <CartItemCardStyled>
                  <ContentRowStyled gutter={16} align="middle">
                    <Col xs={6} sm={4}>
                      <ProductImageStyled
                        src="/placeholder-image.jpg"
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100';
                        }}
                      />
                    </Col>
                    <Col xs={18} sm={12}>
                      <Link to={`/products/${item.slug}`}>
                        <ProductTitle level={5} style={{ marginBottom: 4 }}>
                          {item.name}
                        </ProductTitle>
                      </Link>
                      <SmallText type="secondary" style={{ fontSize: 12 }}>
                        by {item.organization_name}
                      </SmallText>
                      <PriceWrapperStyled>
                        <Price strong style={{ fontSize: 16, color: '#1890ff' }}>
                          ${Number.parseFloat(item.price).toFixed(2)}
                        </Price>
                      </PriceWrapperStyled>
                    </Col>
                    <Col xs={12} sm={4}>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(value) => handleUpdateQuantity(item.product_id, value || 1)}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <RightAlignColStyled>
                        <Space direction="vertical" align="end">
                          <TotalPrice strong style={{ fontSize: 18 }}>
                            ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                          </TotalPrice>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveItem(item.product_id)}
                          >
                            Remove
                          </Button>
                        </Space>
                      </RightAlignColStyled>
                    </Col>
                  </ContentRowStyled>
                </CartItemCardStyled>
              )}
            />

            <ClearCartButtonStyled danger onClick={handleClearCart}>
              Clear Cart
            </ClearCartButtonStyled>
          </Col>

          <Col xs={24} lg={8}>
            <SummaryCardStyled title="Order Summary">
              <SummaryRowStyled>
                <Text>Subtotal:</Text>
                <Text strong>${subtotal.toFixed(2)}</Text>
              </SummaryRowStyled>
              <SummaryRowStyled>
                <Text>Tax (10%):</Text>
                <Text strong>${tax.toFixed(2)}</Text>
              </SummaryRowStyled>
              <SummaryRowStyled>
                <Text>Shipping:</Text>
                <Text strong>${shipping.toFixed(2)}</Text>
              </SummaryRowStyled>
              <Divider />
              <SummaryRowStyled>
                <Title level={4}>Total:</Title>
                <TotalTitle level={4} style={{ color: '#1890ff' }}>
                  ${total.toFixed(2)}
                </TotalTitle>
              </SummaryRowStyled>
              <CheckoutButtonStyled type="primary" size="large" block onClick={handleCheckout}>
                Proceed to Checkout
              </CheckoutButtonStyled>
              <Link to="/products">
                <ContinueShoppingButtonStyled block>Continue Shopping</ContinueShoppingButtonStyled>
              </Link>
            </SummaryCardStyled>
          </Col>
        </ContentRowStyled>
      </ContainerStyled>
    </Layout>
  );
};
