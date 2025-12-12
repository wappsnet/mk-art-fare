import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Input,
  Slider,
  Button,
  Typography,
  Spin,
  Empty,
  Pagination,
  Drawer,
  Select,
} from 'antd';
import { SearchOutlined, ShoppingCartOutlined, FilterOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { Layout } from '@/components/Layout';
import { useGetProductsQuery, useGetGlobalCategoriesQuery } from '@/services/apiSlice';
import {
  PageContainer,
  PageHeader,
  Container,
  Sidebar,
  MainContent,
  FilterSection,
  PriceRangeText,
  PriceSliderWrapper,
  MobileFilterButton,
  ProductCard,
  PlaceholderImage,
  ProductPrice,
  ProductShop,
  LoadingContainer,
  PaginationContainer,
} from './styles';

const { Title, Text } = Typography;
const { Search } = Input;

export const ProductsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const limit = 12;

  const { data: categoriesData } = useGetGlobalCategoriesQuery();
  const categories = categoriesData?.data || [];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: productsData, isLoading: loading } = useGetProductsQuery({
    search,
    category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    page,
    limit,
  });

  const products = productsData?.data?.products || [];
  const total = productsData?.data?.total || 0;

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleCategoryChange = (values: string[]) => {
    setSelectedCategories(values);
    setPage(1);
  };

  const handlePriceChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange([value[0], value[1]]);
      setPage(1);
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setSelectedCategories([]);
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={handleSearch}
          enterButton={<SearchOutlined />}
        />
      </FilterSection>

      <FilterSection>
        <Title level={5}>Categories</Title>
        <Select
          mode="multiple"
          placeholder="Select categories"
          allowClear
          value={selectedCategories}
          onChange={handleCategoryChange}
          maxTagCount="responsive"
          style={{ width: '100%' }}
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
        <PriceRangeText type="secondary">
          ${priceRange[0]} - ${priceRange[1]}
        </PriceRangeText>
        <PriceSliderWrapper>
          <Slider
            range
            min={0}
            max={10000}
            step={100}
            value={priceRange}
            onChange={handlePriceChange}
            tooltip={{ formatter: (value) => `$${value}` }}
          />
        </PriceSliderWrapper>
      </FilterSection>

      <Button block onClick={handleClearFilters}>
        Clear All Filters
      </Button>
    </>
  );

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <Title level={2}>Discover Artworks</Title>
          <Text type="secondary">
            Browse through our curated collection of amazing artworks from talented artists
          </Text>
        </PageHeader>

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
            {(() => {
              if (loading) {
                return (
                  <LoadingContainer>
                    <Spin size="large" />
                  </LoadingContainer>
                );
              }

              if (products.length === 0) {
                return (
                  <Empty description="No products found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                );
              }

              return (
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
                                <PlaceholderImage>
                                  <Text type="secondary">No Image</Text>
                                </PlaceholderImage>
                              )
                            }
                          >
                            <ProductShop>
                              by {product.organization_name || 'Unknown Artist'}
                            </ProductShop>
                            <Title level={5} ellipsis={{ rows: 2 }}>
                              {product.name}
                            </Title>
                            <ProductPrice>
                              ${Number.parseFloat(product.price).toFixed(2)}
                            </ProductPrice>
                            <Button type="primary" icon={<ShoppingCartOutlined />} block>
                              Add to Cart
                            </Button>
                          </ProductCard>
                        </Link>
                      </Col>
                    ))}
                  </Row>

                  <PaginationContainer>
                    <Pagination
                      current={page}
                      total={total}
                      pageSize={limit}
                      onChange={setPage}
                      showSizeChanger={false}
                      showTotal={(total) => `Total ${total} products`}
                    />
                  </PaginationContainer>
                </>
              );
            })()}
          </MainContent>
        </Container>
      </PageContainer>
    </Layout>
  );
};
