import { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Slider,
  Button,
  Typography,
  Spin,
  Empty,
  Pagination,
  Drawer,
  Space,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  FilterOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { Layout } from '../components/Layout';
import { useGetProductsQuery, useGetGlobalCategoriesQuery } from '@/services/apiSlice';
import { Product } from '../types';

const { Title, Text } = Typography;
const { Search } = Input;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  gap: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  height: fit-content;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const FilterSection = styled.div`
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const MobileFilterButton = styled(Button)`
  display: none;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

const ProductCard = styled(Card)`
  height: 100%;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
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
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const limit = 12;

  const { data: categoriesData } = useGetGlobalCategoriesQuery();
  const categories = categoriesData?.data || [];

  const { data: productsData, isLoading: loading } = useGetProductsQuery({
    search,
    category: selectedCategory,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    page,
    limit,
  });

  const products = productsData?.data?.products || [];
  const total = productsData?.data?.total || 0;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string | undefined) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory(undefined);
    setPriceRange([0, 10000]);
    setPage(1);
  };

  const FilterPanel = () => (
    <>
      <FilterSection>
        <Title level={5}>Search</Title>
        <Search
          placeholder="Search artworks..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch}
          enterButton={<SearchOutlined />}
        />
      </FilterSection>

      <FilterSection>
        <Title level={5}>Category</Title>
        <Select
          style={{ width: '100%' }}
          placeholder="All Categories"
          allowClear
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          {categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.slug}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
      </FilterSection>

      <FilterSection>
        <Title level={5}>Price Range</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          ${priceRange[0]} - ${priceRange[1]}
        </Text>
        <Slider
          range
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onChange={handlePriceChange}
          tooltip={{ formatter: (value) => `$${value}` }}
          style={{ marginTop: 16 }}
        />
      </FilterSection>

      <Button block onClick={handleClearFilters}>
        Clear All Filters
      </Button>
    </>
  );

  return (
    <Layout>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>Discover Artworks</Title>
          <Text type="secondary">
            Browse through our curated collection of amazing artworks from talented artists
          </Text>
        </div>

        <MobileFilterButton
          icon={<FilterOutlined />}
          size="large"
          onClick={() => setDrawerOpen(true)}
        >
          Filters
        </MobileFilterButton>

        <Container>
          {/* Desktop Sidebar */}
          <Sidebar>
            <FilterPanel />
          </Sidebar>

          {/* Mobile Drawer */}
          <Drawer
            title="Filters"
            placement="left"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={300}
          >
            <FilterPanel />
          </Drawer>

          {/* Main Content */}
          <MainContent>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
              </div>
            ) : products.length === 0 ? (
              <Empty description="No products found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {products.map((product) => (
                    <Col xs={24} sm={12} lg={8} key={product.id}>
                      <Link to={`/products/${product.slug}`}>
                        <ProductCard
                          cover={
                            product.images && product.images.length > 0 ? (
                              <img
                                alt={product.name}
                                src={
                                  product.images.find((img) => img.is_thumbnail)?.url ||
                                  product.images[0].url
                                }
                              />
                            ) : (
                              <div
                                style={{
                                  height: 250,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
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
                          <ProductPrice>${parseFloat(product.price).toFixed(2)}</ProductPrice>
                          <Button type="primary" icon={<ShoppingCartOutlined />} block>
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
          </MainContent>
        </Container>
      </div>
    </Layout>
  );
};
