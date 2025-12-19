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
  Space,
} from 'antd';
import { SearchOutlined, ShoppingCartOutlined, FilterOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { Layout } from '@/components/Layout';
import {
  useGetProductsQuery,
  useGetGlobalCategoriesQuery,
  useGetProductFilterFieldsQuery,
} from '@/services/apiSlice';
import { CustomFieldFilter } from '@/components/CustomFieldFilter';
import {
  PageContainerStyled,
  PageHeaderStyled,
  ContainerStyled,
  SidebarStyled,
  MainContentStyled,
  FilterSectionStyled,
  SearchCompactStyled,
  PriceRangeText,
  PriceSliderWrapperStyled,
  MobileFilterButtonStyled,
  ProductCardStyled,
  PlaceholderImageStyled,
  ProductPriceStyled,
  ProductShop,
  LoadingContainerStyled,
  PaginationContainerStyled,
} from './styles';

const { Title, Text } = Typography;

const ProductsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [customFieldFilters, setCustomFieldFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const limit = 12;

  const { data: categoriesData } = useGetGlobalCategoriesQuery();
  const categories = categoriesData?.data || [];

  const { data: filterFieldsData } = useGetProductFilterFieldsQuery();
  const filterFields = filterFieldsData?.data || [];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build custom fields query string (format: fieldId1:value1,fieldId2:value2)
  const customFieldsQuery = Object.entries(customFieldFilters)
    .filter(([_, value]) => value.trim())
    .map(([fieldId, value]) => `${fieldId}:${value}`)
    .join(',');

  const { data: productsData, isLoading: loading } = useGetProductsQuery({
    search,
    category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    customFields: customFieldsQuery || undefined,
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
    setCustomFieldFilters({});
    setPage(1);
  };

  const FilterPanel = () => (
    <>
      <FilterSectionStyled>
        <Title level={5}>Search</Title>
        <SearchCompactStyled>
          <Input
            placeholder="Search artworks..."
            allowClear
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={() => handleSearch(searchInput)}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => handleSearch(searchInput)}
          />
        </SearchCompactStyled>
      </FilterSectionStyled>

      <FilterSectionStyled>
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
      </FilterSectionStyled>

      <FilterSectionStyled>
        <Title level={5}>Price Range</Title>
        <PriceRangeText type="secondary" style={{ fontSize: 12 }}>
          ${priceRange[0]} - ${priceRange[1]}
        </PriceRangeText>
        <PriceSliderWrapperStyled>
          <Slider
            range
            min={0}
            max={10000}
            step={100}
            value={priceRange}
            onChange={handlePriceChange}
            tooltip={{ formatter: (value) => `$${value}` }}
          />
        </PriceSliderWrapperStyled>
      </FilterSectionStyled>

      {filterFields.length > 0 && (
        <FilterSectionStyled>
          <Title level={5}>Custom Filters</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {filterFields.map((field) => (
              <div key={field.id}>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  {field.label || field.name}
                </Text>
                <CustomFieldFilter
                  field={field}
                  value={customFieldFilters[field.id] || ''}
                  onChange={(value) => {
                    setCustomFieldFilters((prev) => ({
                      ...prev,
                      [field.id]: value,
                    }));
                    setPage(1);
                  }}
                />
              </div>
            ))}
          </Space>
        </FilterSectionStyled>
      )}

      <Button block onClick={handleClearFilters}>
        Clear All Filters
      </Button>
    </>
  );

  return (
    <Layout>
      <PageContainerStyled>
        <PageHeaderStyled>
          <Title level={2}>Discover Artworks</Title>
          <Text type="secondary">
            Browse through our curated collection of amazing artworks from talented artists
          </Text>
        </PageHeaderStyled>

        <MobileFilterButtonStyled
          icon={<FilterOutlined />}
          size="large"
          onClick={() => setDrawerOpen(true)}
        >
          Filters
        </MobileFilterButtonStyled>

        <ContainerStyled>
          {/* Desktop Sidebar */}
          <SidebarStyled>
            <FilterPanel />
          </SidebarStyled>

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
          <MainContentStyled>
            {(() => {
              if (loading) {
                return (
                  <LoadingContainerStyled>
                    <Spin size="large" />
                  </LoadingContainerStyled>
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
                          <ProductCardStyled
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
                                <PlaceholderImageStyled>
                                  <Text type="secondary">No Image</Text>
                                </PlaceholderImageStyled>
                              )
                            }
                          >
                            <ProductShop
                              style={{
                                display: 'block',
                                color: '#666',
                                marginBottom: 8,
                                fontSize: 12,
                              }}
                            >
                              by {product.organization_name || 'Unknown Artist'}
                            </ProductShop>
                            <Title level={5} ellipsis={{ rows: 2 }}>
                              {product.name}
                            </Title>
                            <ProductPriceStyled>${product.price.toFixed(2)}</ProductPriceStyled>
                            <Button type="primary" icon={<ShoppingCartOutlined />} block>
                              Add to Cart
                            </Button>
                          </ProductCardStyled>
                        </Link>
                      </Col>
                    ))}
                  </Row>

                  <PaginationContainerStyled>
                    <Pagination
                      current={page}
                      total={total}
                      pageSize={limit}
                      onChange={setPage}
                      showSizeChanger={false}
                      showTotal={(total) => `Total ${total} products`}
                    />
                  </PaginationContainerStyled>
                </>
              );
            })()}
          </MainContentStyled>
        </ContainerStyled>
      </PageContainerStyled>
    </Layout>
  );
};

export default ProductsPage;
