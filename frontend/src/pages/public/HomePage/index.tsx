import { FC } from 'react';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { Box, Container, Grid, Typography, Button, Card, CardContent, Stack } from '@mui/material';
import { Link } from 'react-router';

import AppLayout from '@/components/AppLayout';
import { withKeys } from '@/utils/arrayHelpers';

const HomePage: FC = () => {
  const features = [
    {
      icon: <ShoppingBagIcon sx={{ fontSize: 48 }} />,
      title: 'Browse Art',
      description:
        'Discover unique artworks from talented artists around the world. From paintings to sculptures, find your perfect piece.',
    },
    {
      icon: <AccountBalanceIcon sx={{ fontSize: 48 }} />,
      title: 'Artist Shops',
      description:
        'Artists can create custom shop pages with their branding, showcase their work, and connect with art lovers.',
    },
    {
      icon: <MenuBookIcon sx={{ fontSize: 48 }} />,
      title: 'Community Blog',
      description:
        'Read inspiring stories, art techniques, and industry insights from our vibrant community of artists.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Artworks' },
    { number: '2,500+', label: 'Artists' },
    { number: '50,000+', label: 'Happy Customers' },
  ];

  return (
    <AppLayout>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome to Art Fare
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            The premier e-commerce platform connecting artists with art lovers. Discover amazing
            artworks, support talented artists, and join a vibrant community.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              component={Link}
              to="/products"
              variant="outlined"
              size="large"
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Explore Art
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
            >
              Become an Artist
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" gutterBottom>
            Why Choose Art Fare?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Everything you need to buy, sell, and celebrate art
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {withKeys(features).map((feature) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={feature._key}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box color="primary.main" mb={2}>
                    {feature.value.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    {feature.value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box bgcolor="grey.100" py={8} textAlign="center">
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom mb={6}>
            Our Growing Community
          </Typography>
          <Grid container spacing={4}>
            {withKeys(stats).map((stat) => (
              <Grid size={{ xs: 12, sm: 4 }} key={stat._key}>
                <Typography variant="h2" color="primary.main" gutterBottom>
                  {stat.value.number}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {stat.value.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Join thousands of artists and art lovers on Art Fare today
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
          <Button component={Link} to="/register" variant="contained" size="large">
            Sign Up Now
          </Button>
          <Button component={Link} to="/products" variant="outlined" size="large">
            Browse Gallery
          </Button>
        </Stack>
      </Container>
    </AppLayout>
  );
};

export default HomePage;
