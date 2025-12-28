import { FC } from 'react';

import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Box, Container, Grid, Typography, Link as MuiLink, Stack, IconButton, Divider } from '@mui/material';
import { Link } from 'react-router';

const AppFooter: FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: '#001529', color: 'rgba(255, 255, 255, 0.65)', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" color="white">
                Art Fare
              </Typography>
              <Typography variant="body2">
                A comprehensive e-commerce platform connecting artists with art lovers. Discover
                amazing artworks and support talented artists.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={1}>
              <Typography variant="h6" color="white" gutterBottom>
                Quick Links
              </Typography>
              <MuiLink component={Link} to="/products" color="inherit" underline="hover">
                Browse Products
              </MuiLink>
              <MuiLink component={Link} to="/blog" color="inherit" underline="hover">
                Blog
              </MuiLink>
              <MuiLink component={Link} to="/about" color="inherit" underline="hover">
                About Us
              </MuiLink>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={1}>
              <Typography variant="h6" color="white" gutterBottom>
                For Artists
              </Typography>
              <MuiLink component={Link} to="/register" color="inherit" underline="hover">
                Create Shop
              </MuiLink>
              <MuiLink component={Link} to="/dashboard" color="inherit" underline="hover">
                Artist Dashboard
              </MuiLink>
              <MuiLink component={Link} to="/help" color="inherit" underline="hover">
                Help Center
              </MuiLink>
              <MuiLink component={Link} to="/pricing" color="inherit" underline="hover">
                Pricing
              </MuiLink>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" color="white">
                Connect With Us
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  component="a"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  size="small"
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  size="small"
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  size="small"
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  size="small"
                >
                  <LinkedInIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Stack spacing={2}>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <MuiLink component={Link} to="/privacy" color="inherit" underline="hover" variant="body2">
              Privacy Policy
            </MuiLink>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.45)">•</Typography>
            <MuiLink component={Link} to="/terms" color="inherit" underline="hover" variant="body2">
              Terms of Use
            </MuiLink>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.45)">•</Typography>
            <MuiLink component={Link} to="/help" color="inherit" underline="hover" variant="body2">
              Help Center
            </MuiLink>
          </Stack>
          <Typography variant="body2" align="center" color="rgba(255, 255, 255, 0.45)">
            © {new Date().getFullYear()} Art Fare. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default AppFooter;
