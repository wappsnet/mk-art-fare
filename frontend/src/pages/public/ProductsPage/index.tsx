import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Typography, Spin, Empty, Pagination, Drawer } from 'antd';
import { ShoppingCartOutlined, FilterOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import AppLayout from '@/components/AppLayout';
import {
  useGetProductsQuery,
  useGetGlobalCategoriesQuery,
} from '@/services/apiSlice';
import {
  PageContainerStyled,
  PageHeaderStyled,
  ContainerStyled,
  SidebarStyled,
  MainContentStyled,
  MobileFilterButtonStyled,
  ProductCardStyled,
  PlaceholderImageStyled,
  ProductPriceStyled,
  ProductShop,
  LoadingContainerStyled,
  PaginationContainerStyled,
} from './styles';
import FilterPanel from './Addons/components/FilterPanel';

const { Title, Text } = Typography;

const ProductsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const limit = 12;

  const { data: categoriesData } = useGetGlobalCategoriesQuery();
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

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

  const Filters = useMemo(() => {
    return (
      <FilterPanel
        categories={categories}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        handleClearFilters={handleClearFilters}
        selectedCategories={selectedCategories}
        handleCategoryChange={handleCategoryChange}
        priceRange={priceRange}
        handlePriceChange={handlePriceChange}
      />
    );
  }, [categories, priceRange, searchInput, selectedCategories]);

  return (
    <AppLayout>
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
          <SidebarStyled>{Filters}</SidebarStyled>

          {/* Mobile Drawer */}
          <Drawer
            title="Filters"
            placement="left"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={300}
          >
            {Filters}
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
                              css={{
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
    </AppLayout>
  );
};

export default ProductsPage;
