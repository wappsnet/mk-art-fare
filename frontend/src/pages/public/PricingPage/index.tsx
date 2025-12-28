import { FC } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';
import { useAppSelector } from '@/hooks/useRedux';

const PricingPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleGetStarted = (plan: string) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    if (plan === 'pro') {
      navigate('/account/subscription');
    }
  };

  const pricingPlans = [
    {
      name: 'Basic',
      price: 'Free',
      period: 'forever',
      icon: <StarIcon sx={{ fontSize: 40 }} />,
      description: 'Perfect for getting started',
      features: [
        '1 shop',
        'Up to 10 products',
        'Basic product management',
        'Image uploads',
        'Order management',
        'Customer support',
      ],
      buttonText: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      description: 'For serious artists and businesses',
      features: [
        'Unlimited shops',
        'Unlimited products',
        'Advanced product management',
        'Custom fields',
        'Priority support',
        'Analytics dashboard',
        'Category management',
        'Bulk operations',
      ],
      buttonText: 'Upgrade to Pro',
      popular: true,
    },
  ];

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h2" gutterBottom>
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose the plan that works best for you. Upgrade or downgrade anytime.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center" mb={8}>
          {pricingPlans.map((plan) => (
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 5, xl: 4 }} key={plan.name}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  border: plan.popular ? 2 : 1,
                  borderColor: plan.popular ? 'primary.main' : 'divider',
                  boxShadow: plan.popular ? 4 : 1,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: plan.popular ? 8 : 4,
                  },
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="warning"
                    size="small"
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  />
                )}
                <CardContent>
                  <Stack spacing={3}>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box color="primary.main">{plan.icon}</Box>
                        <Typography variant="h4">{plan.name}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {plan.description}
                      </Typography>
                    </Stack>

                    <Box>
                      <Typography variant="h3" component="span" color="primary.main" fontWeight="bold">
                        {plan.price}
                      </Typography>
                      <Typography variant="body1" component="span" color="text.secondary" ml={0.5}>
                        /{plan.period}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => handleGetStarted(plan.name.toLowerCase())}
                    >
                      {plan.buttonText}
                    </Button>

                    <List dense>
                      {plan.features.map((feature) => (
                        <ListItem key={feature} disableGutters>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>
            Need help choosing?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visit our{' '}
            <Button variant="text" onClick={() => navigate('/help')}>
              Help Center
            </Button>{' '}
            or contact our support team for personalized recommendations.
          </Typography>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default PricingPage;
