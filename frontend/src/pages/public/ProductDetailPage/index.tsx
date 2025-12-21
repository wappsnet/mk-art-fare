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
  Descriptions,
} from 'antd';
import { ShoppingCartOutlined, ShopOutlined, ZoomInOutlined } from '@ant-design/icons';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import AppLayout from '@/components/AppLayout';
import {
  useGetProductQuery,
  useAddToCartMutation,
  useGetProductFieldValuesQuery,
} from '@/services/apiSlice';
import { FieldValueDisplay } from '@/components/FieldValueDisplay';
import {
  ContainerStyled,
  ImageGalleryStyled,
  MainImageContainerStyled,
  ZoomHintStyled,
  ThumbnailsContainerStyled,
  ThumbnailStyled,
  PriceSectionStyled,
  PriceStyled,
  ComparePriceStyled,
  LoadingContainerStyled,
  QuantityContainerStyled,
} from './styles';

const { Title, Paragraph, Text } = Typography;

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: productData, isLoading: loading } = useGetProductQuery(slug || '', {
    skip: !slug,
  });
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();

  const product = productData?.data;

  // Fetch custom field values for the product
  const { data: fieldValuesData } = useGetProductFieldValuesQuery(product?.id || 0, {
    skip: !product?.id,
  });
  const fieldValues = fieldValuesData?.data || [];

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
            style={{ marginBottom: 24 }}
          />

          <Row gutter={[48, 48]}>
            <Col xs={24} md={12}>
              {images.length > 0 ? (
                <ImageGalleryStyled>
                  <Zoom>
                    <MainImageContainerStyled>
                      <img src={currentImage?.url} alt={currentImage?.alt_text || product.name} />
                      <ZoomHintStyled className="zoom-hint">
                        <ZoomInOutlined /> Click to zoom
                      </ZoomHintStyled>
                    </MainImageContainerStyled>
                  </Zoom>

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

              <PriceSectionStyled>
                <PriceStyled>
                  ${product.price.toFixed(2)}
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <ComparePriceStyled>${product.compare_at_price.toFixed(2)}</ComparePriceStyled>
                  )}
                </PriceStyled>
                {product.stock_quantity > 0 ? (
                  <Tag color="success" style={{ marginTop: 12 }}>
                    {product.stock_quantity} in stock
                  </Tag>
                ) : (
                  <Tag color="error" style={{ marginTop: 12 }}>
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

              {fieldValues.length > 0 && (
                <>
                  <Title level={5}>Product Details</Title>
                  <Descriptions column={1} bordered size="small">
                    {fieldValues.map((field) => (
                      <Descriptions.Item key={field.id} label={field.label || field.name}>
                        <FieldValueDisplay field={field} />
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
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
                  style={{ marginLeft: 16 }}
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
