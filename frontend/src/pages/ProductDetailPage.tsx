import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Typography, Button, InputNumber, Divider, Tag, Spin, message, Breadcrumb, Image } from 'antd';
import { ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { Layout } from '../components/Layout';
import { useGetProductQuery, useAddToCartMutation } from '../services/apiSlice';

const { Title, Paragraph, Text } = Typography;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const ProductImage = styled.div`
  width: 100%;
  height: 500px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PriceSection = styled.div`
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  margin: 24px 0;
`;

const Price = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
`;

const ComparePrice = styled.span`
  font-size: 20px;
  color: #999;
  text-decoration: line-through;
  margin-left: 16px;
`;

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);

  const { data: productData, isLoading: loading, error } = useGetProductQuery(slug || '', {
    skip: !slug
  });
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();

  const product = productData?.data;

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({ product_id: product.id, quantity }).unwrap();
      message.success('Added to cart!');
    } catch (error) {
      message.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        </Container>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <Container>
          <Title level={3}>Product not found</Title>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Breadcrumb
          items={[
            { title: <Link to="/">Home</Link> },
            { title: <Link to="/products">Products</Link> },
            { title: product.name }
          ]}
          style={{ marginBottom: 24 }}
        />

        <Row gutter={[48, 48]}>
          <Col xs={24} md={12}>
            {product.images && product.images.length > 0 ? (
              <Image.PreviewGroup>
                <ProductImage>
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </ProductImage>
                {product.images.length > 1 && (
                  <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                    {product.images.slice(1, 5).map((img, index) => (
                      <Col span={6} key={index}>
                        <Image
                          src={img.url}
                          alt={`${product.name} ${index + 2}`}
                          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </Image.PreviewGroup>
            ) : (
              <ProductImage>
                <Text type="secondary">No Image Available</Text>
              </ProductImage>
            )}
          </Col>

          <Col xs={24} md={12}>
            <Link to={`/shop/${product.organization_slug}`}>
              <Button type="link" icon={<ShopOutlined />} style={{ padding: 0, marginBottom: 8 }}>
                {product.organization_name || 'Unknown Artist'}
              </Button>
            </Link>

            <Title level={2}>{product.name}</Title>

            {product.sku && (
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                SKU: {product.sku}
              </Text>
            )}

            <PriceSection>
              <Price>
                ${product.price.toFixed(2)}
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <ComparePrice>${product.compare_at_price.toFixed(2)}</ComparePrice>
                )}
              </Price>
              {product.stock_quantity > 0 ? (
                <Tag color="success" style={{ marginTop: 12 }}>
                  {product.stock_quantity} in stock
                </Tag>
              ) : (
                <Tag color="error" style={{ marginTop: 12 }}>
                  Out of stock
                </Tag>
              )}
            </PriceSection>

            <Divider />

            {product.description && (
              <>
                <Title level={5}>Description</Title>
                <Paragraph>{product.description}</Paragraph>
                <Divider />
              </>
            )}

            <div style={{ marginBottom: 24 }}>
              <Text strong>Quantity:</Text>
              <InputNumber
                min={1}
                max={product.stock_quantity}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                style={{ marginLeft: 16 }}
              />
            </div>

            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              loading={adding}
              block
            >
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};
