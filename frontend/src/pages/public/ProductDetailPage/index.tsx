import { useState } from 'react';

import { ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';
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
  Image,
} from 'antd';
import { useParams, Link } from 'react-router';

import AppLayout from '@/components/AppLayout';
import { useGetProductQuery, useAddToCartMutation } from '@/services/apiSlice';

import {
  ContainerStyled,
  ImageGalleryStyled,
  MainImageContainerStyled,
  ThumbnailsContainerStyled,
  ThumbnailStyled,
  PriceSectionStyled,
  PriceStyled,
  ComparePriceStyled,
  LoadingContainerStyled,
  QuantityContainerStyled,
} from './styles';

const { Title, Paragraph, Text } = Typography;

// eslint-disable-next-line complexity
const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: productData, isLoading: loading } = useGetProductQuery(slug || '', {
    skip: !slug,
  });
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();

  const product = productData?.data;

  const handleAddToCart = async () => {
    if (product) {
      try {
        await addToCart({ productId: product.id, quantity }).unwrap();
        message.success('Added to cart!');
      } catch {
        message.error('Failed to add to cart');
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <ContainerStyled>
          <LoadingContainerStyled>
            <Spin size="large" />
          </LoadingContainerStyled>
        </ContainerStyled>
      </AppLayout>
    );
  }

  if (product) {
    const images = product.images || [];
    const currentImage = images[selectedImageIndex];

    return (
      <AppLayout>
        <ContainerStyled>
          <Breadcrumb
            items={[
              { title: <Link to="/">Home</Link> },
              { title: <Link to="/products">Products</Link> },
              { title: product.name },
            ]}
            css={{ marginBottom: 24 }}
          />

          <Row gutter={[48, 48]}>
            <Col xs={24} md={12}>
              {images.length > 0 ? (
                <ImageGalleryStyled>
                  <MainImageContainerStyled>
                    <Image
                      src={currentImage?.url}
                      alt={currentImage?.alt_text || product.name}
                      preview={{
                        src: currentImage?.url,
                      }}
                    />
                  </MainImageContainerStyled>

                  {images.length > 1 && (
                    <ThumbnailsContainerStyled>
                      {images.map((img, index) => (
                        <ThumbnailStyled
                          key={img.id}
                          active={index === selectedImageIndex}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img src={img.url} alt={img.alt_text || `${product.name} ${index + 1}`} />
                        </ThumbnailStyled>
                      ))}
                    </ThumbnailsContainerStyled>
                  )}
                </ImageGalleryStyled>
              ) : (
                <MainImageContainerStyled>
                  <Text type="secondary">No Image Available</Text>
                </MainImageContainerStyled>
              )}
            </Col>

            <Col xs={24} md={12}>
              <Link to={`/shop/${product.organization_slug}`}>
                <Button type="link" icon={<ShopOutlined />} css={{ padding: 0, marginBottom: 8 }}>
                  {product.organization_name || 'Unknown Artist'}
                </Button>
              </Link>

              <Title level={2}>{product.name}</Title>

              {product.sku && (
                <Text type="secondary" css={{ display: 'block', marginBottom: 16 }}>
                  SKU: {product.sku}
                </Text>
              )}

              <PriceSectionStyled>
                <PriceStyled>
                  ${product.price.toFixed(2)}
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <ComparePriceStyled>${product.compare_at_price.toFixed(2)}</ComparePriceStyled>
                  )}
                </PriceStyled>
                {product.stock_quantity > 0 ? (
                  <Tag color="success" css={{ marginTop: 12 }}>
                    {product.stock_quantity} in stock
                  </Tag>
                ) : (
                  <Tag color="error" css={{ marginTop: 12 }}>
                    Out of stock
                  </Tag>
                )}
              </PriceSectionStyled>

              <Divider />

              {product.description && (
                <>
                  <Title level={5}>Description</Title>
                  <Paragraph>{product.description}</Paragraph>
                  <Divider />
                </>
              )}

              <QuantityContainerStyled>
                <Text strong>Quantity:</Text>
                <InputNumber
                  min={1}
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  css={{ marginLeft: 16 }}
                />
              </QuantityContainerStyled>

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
        </ContainerStyled>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ContainerStyled>
        <Title level={3}>Product not found</Title>
      </ContainerStyled>
    </AppLayout>
  );
};

export default ProductDetailPage;
