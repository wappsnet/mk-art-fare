import { FC, useState, useEffect, useMemo } from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';
import { Container, Button, Typography, Box } from '@mui/material';

import AppDataGrid from '@/components/AppDataGrid';
import AppDrawer from '@/components/AppDrawer';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import ProductCard from '@/components/ProductCard';
import { useGetProductsQuery, useGetGlobalCategoriesQuery } from '@/services/apiSlice';

import FilterPanel from './Addons/components/FilterPanel';

const ProductsPage: FC = () => {
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
    }, 500);

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
      <Container maxWidth="xl" sx={{ py: 8 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            Discover Artworks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse through our curated collection of amazing artworks from talented artists
          </Typography>
        </Box>

        {/* Mobile Filter Button */}
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          size="large"
          onClick={() => setDrawerOpen(true)}
          sx={{ mb: 3, display: { xs: 'inline-flex', md: 'none' } }}
        >
          Filters
        </Button>

        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Desktop Sidebar */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              position: 'sticky',
              top: 80,
              height: 'fit-content',
              display: { xs: 'none', md: 'block' },
            }}
          >
            {Filters}
          </Box>

          {/* Mobile Drawer */}
          <AppDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Filters"
            width={320}
          >
            {Filters}
          </AppDrawer>

          {/* Main Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <AppDataGrid
              data={products}
              isLoading={loading}
              emptyContent={
                <EmptyState title="No products found" description="Try adjusting your filters" />
              }
              renderItem={(product) => (
                <ProductCard
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.primary_image_url ?? product.images?.[0]?.url}
                  organizationName={product.organization_name || 'Unknown Artist'}
                  stockQuantity={product.stock_quantity}
                />
              )}
              getItemKey={(product) => product.id}
              gridProps={{ xs: 12, sm: 6, lg: 4 }}
              pagination={{
                page,
                pageSize: limit,
                total,
                onPageChange: (newPage) => setPage(newPage),
              }}
            />
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default ProductsPage;
