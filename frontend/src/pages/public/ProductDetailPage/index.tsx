import { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  Row,
  Col,
  Typography,
  Button,
  InputNumber,
  Divider,
  Tag,
  Spin,
  message,
  Breadcrumb,
} from 'antd';
import { ShoppingCartOutlined, ShopOutlined, ZoomInOutlined } from '@ant-design/icons';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { Layout } from '@/components/Layout';
import { useGetProductQuery, useAddToCartMutation } from '@/services/apiSlice';
import {
  Container,
  ImageGallery,
  MainImageContainer,
  ZoomHint,
  ThumbnailsContainer,
  Thumbnail,
  PriceSection,
  Price,
  ComparePrice,
  LoadingContainer,
  QuantityContainer,
} from './styles';

const { Title, Paragraph, Text } = Typography;

export const ProductDetailPage = () => {
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

  if (loading) {
    return (
      <Layout>
        <Container>
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
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

  const images = product.images || [];
  const currentImage = images[selectedImageIndex];

  return (
    <Layout>
      <Container>
        <Breadcrumb
          items={[
            { title: <Link to="/">Home</Link> },
            { title: <Link to="/products">Products</Link> },
            { title: product.name },
          ]}
          style={{ marginBottom: 24 }}
        />

        <Row gutter={[48, 48]}>
          <Col xs={24} md={12}>
            {images.length > 0 ? (
              <ImageGallery>
                <Zoom>
                  <MainImageContainer>
                    <img src={currentImage?.url} alt={currentImage?.alt_text || product.name} />
                    <ZoomHint className="zoom-hint">
                      <ZoomInOutlined /> Click to zoom
                    </ZoomHint>
                  </MainImageContainer>
                </Zoom>

                {images.length > 1 && (
                  <ThumbnailsContainer>
                    {images.map((img, index) => (
                      <Thumbnail
                        key={img.id}
                        active={index === selectedImageIndex}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img src={img.url} alt={img.alt_text || `${product.name} ${index + 1}`} />
                      </Thumbnail>
                    ))}
                  </ThumbnailsContainer>
                )}
              </ImageGallery>
            ) : (
              <MainImageContainer>
                <Text type="secondary">No Image Available</Text>
              </MainImageContainer>
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
                ${Number.parseFloat(product.price).toFixed(2)}
                {product.compare_at_price &&
                  Number.parseFloat(product.compare_at_price) >
                    Number.parseFloat(product.price) && (
                    <ComparePrice>
                      ${Number.parseFloat(product.compare_at_price).toFixed(2)}
                    </ComparePrice>
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

            <QuantityContainer>
              <Text strong>Quantity:</Text>
              <InputNumber
                min={1}
                max={product.stock_quantity}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                style={{ marginLeft: 16 }}
              />
            </QuantityContainer>

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
