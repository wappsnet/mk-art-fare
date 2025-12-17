import { useParams, Link } from 'react-router';
import { Row, Col, Typography, Button, Tabs, Spin, Empty, Tag } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { useGetOrganizationQuery, useGetOrganizationProductsQuery } from '@/services/apiSlice';
import {
  ShopHeaderStyled,
  BannerImageStyled,
  ShopContentStyled,
  ContainerStyled,
  ShopLogoStyled,
  ProductCardStyled,
  ProductPriceStyled,
  LoadingContainerStyled,
  NoImagePlaceholderStyled,
  AboutCardStyled,
  ShopInfoSectionStyled,
  ShopInfoContentStyled,
} from './styles';

const { Title, Paragraph, Text } = Typography;

export const ShopPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: shopData, isLoading: shopLoading } = useGetOrganizationQuery(slug || '', {
    skip: !slug,
  });
  const { data: productsData, isLoading: productsLoading } = useGetOrganizationProductsQuery(
    slug || '',
    {
      skip: !slug,
    }
  );

  const shop = shopData?.data;
  const products = productsData?.data || [];
  const loading = shopLoading || productsLoading;

  if (loading) {
    return (
      <Layout>
        <LoadingContainerStyled>
          <Spin size="large" />
        </LoadingContainerStyled>
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout>
        <ContainerStyled>
          <Title level={3}>Shop not found</Title>
        </ContainerStyled>
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
                    <ProductCardStyled
                      cover={
                        product.images?.[0] ? (
                          <img alt={product.name} src={product.images[0].url} />
                        ) : (
                          <NoImagePlaceholderStyled>
                            <Text type="secondary">No Image</Text>
                          </NoImagePlaceholderStyled>
                        )
                      }
                    >
                      <Title level={5} ellipsis={{ rows: 2 }}>
                        {product.name}
                      </Title>
                      <ProductPriceStyled>${Number.parseFloat(product.price).toFixed(2)}</ProductPriceStyled>
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
                    </ProductCardStyled>
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No products available in this shop yet" />
          )}
        </>
      ),
    },
    {
      key: 'about',
      label: 'About',
      children: (
        <AboutCardStyled>
          <Title level={4}>About {shop.name}</Title>
          {shop.description ? (
            <Paragraph>{shop.description}</Paragraph>
          ) : (
            <Text type="secondary">No description available</Text>
          )}
          <ShopInfoSectionStyled>
            <Text strong>Shop Information</Text>
            <ShopInfoContentStyled>
              <Text type="secondary">Visit this shop to discover unique artwork and products.</Text>
            </ShopInfoContentStyled>
          </ShopInfoSectionStyled>
        </AboutCardStyled>
      ),
    },
  ];

  return (
    <Layout>
      <ShopHeaderStyled bgColor={shop.primary_color} textColor={shop.text_color}>
        {shop.banner_url && <BannerImageStyled url={shop.banner_url} />}
        <ShopContentStyled>
          {shop.logo_url && <ShopLogoStyled src={shop.logo_url} alt={shop.name} />}
          <Title level={1} style={{ color: 'inherit', marginBottom: 16 }}>
            {shop.name}
          </Title>
          {shop.description && (
            <Paragraph style={{ color: 'inherit', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
              {shop.description}
            </Paragraph>
          )}
        </ShopContentStyled>
      </ShopHeaderStyled>

      <ContainerStyled>
        <Tabs items={tabItems} />
      </ContainerStyled>
    </Layout>
  );
};
