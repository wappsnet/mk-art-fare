import { FC } from 'react';

import InfoIcon from '@mui/icons-material/Info';
import PaletteIcon from '@mui/icons-material/Palette';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import { Container, Typography, Stack, Box, Grid, Card, CardContent } from '@mui/material';

import AppLayout from '@/components/AppLayout';

const AboutPage: FC = () => {
  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={6}>
          {/* Header */}
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box color="primary.main">
              <InfoIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h3">About Art Fare</Typography>
            <Typography variant="body1" color="text.secondary" maxWidth="md">
              Art Fare is a comprehensive e-commerce platform connecting talented artists with art
              lovers around the world. We believe in empowering artists to showcase and sell their
              work while providing art enthusiasts with a curated marketplace of unique creations.
            </Typography>
          </Stack>

          {/* Mission Section */}
          <Box>
            <Typography variant="h4" gutterBottom textAlign="center">
              Our Mission
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth="md" mx="auto">
              To create a thriving ecosystem where artists can build sustainable businesses and art
              lovers can discover and acquire authentic, original artwork directly from creators.
            </Typography>
          </Box>

          {/* Features Grid */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Box color="primary.main" mb={2}>
                    <PaletteIcon sx={{ fontSize: 48 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    For Artists
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your own shop, manage your products, and reach a global audience. Our
                    platform provides all the tools you need to succeed as an independent artist.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Box color="primary.main" mb={2}>
                    <PeopleIcon sx={{ fontSize: 48 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    For Collectors
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Discover unique artwork from talented artists worldwide. Browse our curated
                    marketplace and build your collection with authentic, original pieces.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Box color="primary.main" mb={2}>
                    <StarIcon sx={{ fontSize: 48 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    Quality Guaranteed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Every artist and product on our platform is carefully reviewed to ensure
                    authenticity and quality. Shop with confidence knowing you're getting the real
                    deal.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Our Story */}
          <Stack spacing={3}>
            <Typography variant="h4" textAlign="center">
              Our Story
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Art Fare was founded with a simple belief: artists deserve a platform that empowers
              them to thrive. Traditional art marketplaces often take large commissions and give
              artists little control over their brand. We set out to change that.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Our platform was built by artists, for artists. Every feature, from customizable
              storefronts to flexible pricing tools, was designed with the creative community in
              mind. We handle the technology and logistics so artists can focus on what they do
              best: creating amazing art.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Today, Art Fare is home to thousands of artists and collectors from around the world.
              We're proud to be part of a movement that's making art more accessible and helping
              artists build sustainable careers doing what they love.
            </Typography>
          </Stack>

          {/* Values */}
          <Stack spacing={3}>
            <Typography variant="h4" textAlign="center">
              Our Values
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Artist First
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We prioritize the needs and success of our artist community in every decision
                    we make.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Authenticity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We believe in genuine connections between artists and collectors through
                    authentic, original artwork.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Transparency
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clear pricing, honest communication, and fair policies for everyone on our
                    platform.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Innovation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Continuously improving our platform with new features and tools to serve our
                    community better.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </Container>
    </AppLayout>
  );
};

export default AboutPage;
