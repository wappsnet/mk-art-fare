import { FC } from 'react';

import StarIcon from '@mui/icons-material/Star';
import { Typography, Button, Stack, Chip, Card, CardContent, Box } from '@mui/material';

import type { UserSubscription, UsageStats } from '@/types/subscription';

interface CurrentPlanBannerProps {
  subscription: UserSubscription | undefined;
  usage: UsageStats | undefined;
  currentPlan: string;
  onUpgrade: () => void;
  onDowngrade: () => void;
  isUpgrading: boolean;
  isDowngrading: boolean;
}

const CurrentPlanBanner: FC<CurrentPlanBannerProps> = ({
  subscription,
  usage,
  currentPlan,
  onUpgrade,
  onDowngrade,
  isUpgrading,
  isDowngrading,
}) => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5">Current Plan</Typography>
            <Chip
              label={subscription?.plan_name || 'Basic'}
              color={currentPlan === 'pro' ? 'primary' : 'default'}
            />
          </Stack>

          {usage && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Usage:
              </Typography>
              <Typography variant="body2">
                Shops: {usage.organizations.current} /{' '}
                {usage.organizations.unlimited ? 'Unlimited' : usage.organizations.max}
              </Typography>
              <Typography variant="body2">
                Products: {usage.products.current} /{' '}
                {usage.products.unlimited ? 'Unlimited' : usage.products.max}
              </Typography>
            </Box>
          )}

          <Typography variant="body1">
            {currentPlan === 'basic'
              ? 'You are on the free Basic plan. Upgrade to Pro for unlimited features!'
              : 'You are on the Pro plan with full access to all features.'}
          </Typography>

          {currentPlan === 'basic' ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<StarIcon />}
              onClick={onUpgrade}
              disabled={isUpgrading}
              sx={{ alignSelf: 'flex-start' }}
            >
              Upgrade to Pro
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="large"
              onClick={onDowngrade}
              disabled={isDowngrading}
              sx={{ alignSelf: 'flex-start' }}
            >
              Downgrade to Basic
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CurrentPlanBanner;
