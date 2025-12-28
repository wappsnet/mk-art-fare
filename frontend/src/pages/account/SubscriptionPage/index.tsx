import { FC, createElement } from 'react';

import { Typography, Stack, CircularProgress, Alert, Box } from '@mui/material';

import { useConfirm } from '@/components/ConfirmDialog';
import { subscriptionPlans } from '@/config/subscription.ts';
import {
  useGetCurrentSubscriptionQuery,
  useUpgradeSubscriptionMutation,
  useDowngradeSubscriptionMutation,
} from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

import CurrentPlanBanner from './Addons/components/CurrentPlanBanner';
import PlanCard from './Addons/components/PlanCard';

const SubscriptionPage: FC = () => {
  const { data: subscriptionData, isLoading, error } = useGetCurrentSubscriptionQuery();
  const [upgradeSubscription, { isLoading: isUpgrading }] = useUpgradeSubscriptionMutation();
  const [downgradeSubscription, { isLoading: isDowngrading }] = useDowngradeSubscriptionMutation();
  const { confirm } = useConfirm();

  const subscription = subscriptionData?.data?.subscription;
  const usage = subscriptionData?.data?.usage;
  const currentPlan = subscription?.plan_slug || 'basic';

  const handleUpgrade = () => {
    confirm({
      title: 'Upgrade to Pro Plan',
      content: (
        <Stack spacing={2}>
          <Typography variant="body1">
            You are about to upgrade to the Pro plan. You will get:
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">• Unlimited shops</Typography>
            <Typography variant="body2">• Unlimited products</Typography>
            <Typography variant="body2">• Advanced features</Typography>
            <Typography variant="body2">• Priority support</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            No payment required at this time. This is for demonstration purposes.
          </Typography>
        </Stack>
      ),
      onConfirm: async () => {
        try {
          await upgradeSubscription().unwrap();
          message.success('Successfully upgraded to Pro plan!');
        } catch (err) {
          message.error(getErrorMessage(err) || 'Failed to upgrade subscription');
        }
      },
    });
  };

  const handleDowngrade = () => {
    const orgCount = usage?.organizations?.current || 0;
    const productCount = usage?.products?.current || 0;
    const exceedsLimits = orgCount > 1 || productCount > 10;

    confirm({
      title: 'Downgrade to Basic Plan',
      content: (
        <Stack spacing={2}>
          <Typography variant="body1">
            You are about to downgrade to the Basic plan. You will be limited to:
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">• 1 shop only</Typography>
            <Typography variant="body2">• Up to 10 products</Typography>
            <Typography variant="body2">• Basic features only</Typography>
          </Stack>
          {exceedsLimits && (
            <Alert severity="warning">
              <Typography variant="subtitle2" gutterBottom>
                Cannot Downgrade
              </Typography>
              <Typography variant="body2" gutterBottom>
                You currently have:
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">• {orgCount} shop(s) (Basic allows 1)</Typography>
                <Typography variant="body2">
                  • {productCount} product(s) (Basic allows 10)
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please delete extra shops or products before downgrading.
              </Typography>
            </Alert>
          )}
        </Stack>
      ),
      confirmButtonProps: { disabled: exceedsLimits },
      onConfirm: async () => {
        try {
          await downgradeSubscription().unwrap();
          message.success('Successfully downgraded to Basic plan');
        } catch (err) {
          message.error(getErrorMessage(err) || 'Failed to downgrade subscription');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="body1">Loading subscription information...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <Typography variant="subtitle1" gutterBottom>
          Error Loading Subscription
        </Typography>
        <Typography variant="body2">
          Failed to load subscription information. Please try again later.
        </Typography>
      </Alert>
    );
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Your Subscription
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your subscription plan and billing information
        </Typography>
      </Box>

      <CurrentPlanBanner
        subscription={subscription}
        usage={usage}
        currentPlan={currentPlan}
        onUpgrade={handleUpgrade}
        onDowngrade={handleDowngrade}
        isUpgrading={isUpgrading}
        isDowngrading={isDowngrading}
      />

      <Box>
        <Typography variant="h5" gutterBottom>
          Available Plans
        </Typography>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {subscriptionPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={{
                ...plan,
                icon: createElement(plan.icon),
              }}
              isCurrentPlan={currentPlan === plan.id}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export default SubscriptionPage;
