import { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Slider, Button, Typography, Spin, Empty, Pagination } from 'antd';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { Layout } from '../components/Layout';
import { apiService } from '../services/api';
import { Product, ApiResponse } from '../types';

const { Title, Text } = Typography;
const { Search } = Input;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const FilterSection = styled.div`
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 32px;
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

const ProductShop = styled(Text)`
  display: block;
  color: #666;
  margin-bottom: 8px;
  font-size: 12px;
`;

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const response = await apiService.get<ApiResponse<Product[]>>(`/products?${params}`);

      if (response.success && response.data) {
        setProducts(response.data);
        setTotal(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const filteredProducts = products.filter(
    product => product.price >= priceRange[0] && product.price <= priceRange[1]
  );

  return (
    <Layout>
      <Container>
        <Title level={2}>Discover Artworks</Title>
        <Text type="secondary">
          Browse through our curated collection of amazing artworks from talented artists
        </Text>

        <FilterSection style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Search
                placeholder="Search artworks..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
              />
            </Col>
            <Col xs={24} md={12}>
              <div>
                <Text>Price Range: ${priceRange[0]} - ${priceRange[1]}</Text>
                <Slider
                  range
                  min={0}
                  max={10000}
                  step={100}
                  value={priceRange}
                  onChange={setPriceRange}
                  tooltip={{ formatter: (value) => `$${value}` }}
                />
              </div>
            </Col>
          </Row>
        </FilterSection>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Empty
            description="No products found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {filteredProducts.map((product) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
                  <Link to={`/products/${product.slug}`}>
                    <ProductCard
                      cover={
                        product.images && product.images[0] ? (
                          <img
                            alt={product.name}
                            src={product.images[0].url}
                          />
                        ) : (
                          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text type="secondary">No Image</Text>
                          </div>
                        )
                      }
                    >
                      <ProductShop>
                        by {product.organization_name || 'Unknown Artist'}
                      </ProductShop>
                      <Title level={5} ellipsis={{ rows: 2 }}>
                        {product.name}
                      </Title>
                      <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        block
                      >
                        Add to Cart
                      </Button>
                    </ProductCard>
                  </Link>
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={limit}
                onChange={setPage}
                showSizeChanger={false}
                showTotal={(total) => `Total ${total} products`}
              />
            </div>
          </>
        )}
      </Container>
    </Layout>
  );
};
