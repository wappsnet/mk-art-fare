import { useParams, Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Tabs, Spin, Empty, Tag, Avatar } from 'antd';
import { ShoppingCartOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { Layout } from '../components/Layout';
import { useGetOrganizationQuery, useGetOrganizationProductsQuery } from '../services/apiSlice';

const { Title, Paragraph, Text } = Typography;

const ShopHeader = styled.div<{ bgColor?: string; textColor?: string }>`
  background: ${props => props.bgColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: ${props => props.textColor || '#fff'};
  padding: 80px 50px;
  text-align: center;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const BannerImage = styled.div<{ url?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${props => props.url});
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 0;
`;

const ShopContent = styled.div`
  position: relative;
  z-index: 1;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const ShopLogo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
  margin: 0 auto 24px;
  display: block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ProductCard = styled(Card)`
  height: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .ant-card-cover {
    height: 250px;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

const ProductPrice = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin: 12px 0;
`;

export const ShopPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: shopData, isLoading: shopLoading } = useGetOrganizationQuery(slug || '', {
    skip: !slug
  });
  const { data: productsData, isLoading: productsLoading } = useGetOrganizationProductsQuery(slug || '', {
    skip: !slug
  });

  const shop = shopData?.data;
  const products = productsData?.data || [];
  const loading = shopLoading || productsLoading;

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout>
        <Container>
          <Title level={3}>Shop not found</Title>
        </Container>
      </Layout>
    );
  }

  const tabItems = [
    {
      key: 'products',
      label: `Products (${products.length})`,
      children: (
        <>
          {products.length > 0 ? (
            <Row gutter={[24, 24]}>
              {products.map((product) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
                  <Link to={`/products/${product.slug}`}>
                    <ProductCard
                      cover={
                        product.images && product.images[0] ? (
                          <img alt={product.name} src={product.images[0].url} />
                        ) : (
                          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text type="secondary">No Image</Text>
                          </div>
                        )
                      }
                    >
                      <Title level={5} ellipsis={{ rows: 2 }}>
                        {product.name}
                      </Title>
                      <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                      {product.stock_quantity > 0 ? (
                        <Tag color="success">In Stock</Tag>
                      ) : (
                        <Tag color="error">Out of Stock</Tag>
                      )}
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        block
                        style={{ marginTop: 12 }}
                        disabled={product.stock_quantity === 0}
                      >
                        Add to Cart
                      </Button>
                    </ProductCard>
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No products available in this shop yet" />
          )}
        </>
      )
    },
    {
      key: 'about',
      label: 'About',
      children: (
        <Card>
          <Title level={4}>About {shop.name}</Title>
          {shop.description ? (
            <Paragraph>{shop.description}</Paragraph>
          ) : (
            <Text type="secondary">No description available</Text>
          )}
          <div style={{ marginTop: 24 }}>
            <Text strong>Shop Information</Text>
            <div style={{ marginTop: 12 }}>
              <Avatar size={48} icon={<UserOutlined />} style={{ marginRight: 12 }} />
              <Text>{shop.owner_first_name || 'Shop Owner'}</Text>
            </div>
          </div>
        </Card>
      )
    }
  ];

  return (
    <Layout>
      <ShopHeader
        bgColor={shop.primary_color}
        textColor={shop.text_color}
      >
        {shop.banner_url && <BannerImage url={shop.banner_url} />}
        <ShopContent>
          {shop.logo_url && <ShopLogo src={shop.logo_url} alt={shop.name} />}
          <Title level={1} style={{ color: 'inherit', marginBottom: 16 }}>
            {shop.name}
          </Title>
          {shop.description && (
            <Paragraph style={{ color: 'inherit', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
              {shop.description}
            </Paragraph>
          )}
        </ShopContent>
      </ShopHeader>

      <Container>
        <Tabs items={tabItems} />
      </Container>
    </Layout>
  );
};
