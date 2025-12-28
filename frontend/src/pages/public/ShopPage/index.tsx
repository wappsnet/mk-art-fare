import { FC, useState, ReactNode } from 'react';

import {
  Container,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { useParams } from 'react-router';

import AppDataGrid from '@/components/AppDataGrid';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import ProductCard from '@/components/ProductCard';
import { useGetOrganizationQuery, useGetOrganizationProductsQuery } from '@/services/apiSlice';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ShopPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tabValue, setTabValue] = useState(0);

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
      <AppLayout>
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <CircularProgress size={60} />
        </Box>
      </AppLayout>
    );
  }

  if (!shop) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4">Shop not found</Typography>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Shop Header */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: shop.primary_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: shop.text_color || '#fff',
          py: 10,
          px: 6,
          textAlign: 'center',
        }}
      >
        {/* Banner Image Background */}
        {shop.banner_url && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${shop.banner_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.3,
              zIndex: 0,
            }}
          />
        )}

        {/* Shop Content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {shop.logo_url && (
            <Box
              component="img"
              src={shop.logo_url}
              alt={shop.name}
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: '4px solid white',
                objectFit: 'cover',
                mx: 'auto',
                mb: 3,
                display: 'block',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            />
          )}
          <Typography variant="h2" gutterBottom sx={{ color: 'inherit' }}>
            {shop.name}
          </Typography>
          {shop.description && (
            <Typography variant="h6" sx={{ color: 'inherit', maxWidth: 600, mx: 'auto' }}>
              {shop.description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Tabs Section */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Tabs
          variant="scrollable"
          scrollButtons="auto"
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label={`Products (${products.length})`} />
          <Tab label="About" />
        </Tabs>

        {/* Products Tab */}
        <TabPanel value={tabValue} index={0}>
          <AppDataGrid
            data={products}
            isLoading={productsLoading}
            emptyContent={
              <EmptyState
                title="No products available in this shop yet"
                description="Check back later for new products"
              />
            }
            renderItem={(product) => (
              <ProductCard
                slug={product.slug}
                name={product.name}
                price={product.price}
                imageUrl={product.images?.[0]?.url}
                stockQuantity={product.stock_quantity}
              />
            )}
            getItemKey={(product) => product.id}
            gridProps={{ xs: 12, sm: 6, lg: 4, xl: 3 }}
          />
        </TabPanel>

        {/* About Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                About {shop.name}
              </Typography>
              {shop.description ? (
                <Typography variant="body1">{shop.description}</Typography>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No description available
                </Typography>
              )}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Shop Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Visit this shop to discover unique artwork and products.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>
    </AppLayout>
  );
};

export default ShopPage;
