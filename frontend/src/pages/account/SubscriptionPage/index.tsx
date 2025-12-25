import { createElement } from 'react';

import { Typography, Space, Modal, message, Spin, Alert } from 'antd';

import { subscriptionPlans } from '@/config/subscription.ts';
import {
  useGetCurrentSubscriptionQuery,
  useUpgradeSubscriptionMutation,
  useDowngradeSubscriptionMutation,
} from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';

import CurrentPlanBanner from './Addons/components/CurrentPlanBanner';
import PlanCard from './Addons/components/PlanCard';
import { ContainerStyled } from './styles';

const { Title, Text, Paragraph } = Typography;

const SubscriptionPage = () => {
  const { data: subscriptionData, isLoading, error } = useGetCurrentSubscriptionQuery();
  const [upgradeSubscription, { isLoading: isUpgrading }] = useUpgradeSubscriptionMutation();
  const [downgradeSubscription, { isLoading: isDowngrading }] = useDowngradeSubscriptionMutation();

  const subscription = subscriptionData?.data?.subscription;
  const usage = subscriptionData?.data?.usage;
  const currentPlan = subscription?.plan_slug || 'basic';

  const handleUpgrade = () => {
    Modal.confirm({
      title: 'Upgrade to Pro Plan',
      content: (
        <Space direction="vertical">
          <Paragraph>You are about to upgrade to the Pro plan. You will get:</Paragraph>
          <Space direction="vertical" size={4}>
            <Text>• Unlimited shops</Text>
            <Text>• Unlimited products</Text>
            <Text>• Advanced features</Text>
            <Text>• Priority support</Text>
          </Space>
          <Paragraph type="secondary">
            No payment required at this time. This is for demonstration purposes.
          </Paragraph>
        </Space>
      ),
      onOk: async () => {
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

    Modal.confirm({
      title: 'Downgrade to Basic Plan',
      content: (
        <Space direction="vertical">
          <Paragraph>
            You are about to downgrade to the Basic plan. You will be limited to:
          </Paragraph>
          <Space direction="vertical" size={4}>
            <Text>• 1 shop only</Text>
            <Text>• Up to 10 products</Text>
            <Text>• Basic features only</Text>
          </Space>
          {exceedsLimits && (
            <Alert
              type="warning"
              message="Cannot Downgrade"
              description={
                <Space direction="vertical">
                  <Paragraph>You currently have:</Paragraph>
                  <Space direction="vertical" size={4}>
                    <Text>• {orgCount} shop(s) (Basic allows 1)</Text>
                    <Text>• {productCount} product(s) (Basic allows 10)</Text>
                  </Space>
                  <Paragraph>Please delete extra shops or products before downgrading.</Paragraph>
                </Space>
              }
            />
          )}
        </Space>
      ),
      okButtonProps: { disabled: exceedsLimits },
      onOk: async () => {
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
      <ContainerStyled>
        <Space direction="vertical" size={32} css={{ width: '100%', alignItems: 'center' }}>
          <Spin size="large" />
          <Text>Loading subscription information...</Text>
        </Space>
      </ContainerStyled>
    );
  }

  if (error) {
    return (
      <ContainerStyled>
        <Alert
          type="error"
          message="Error Loading Subscription"
          description="Failed to load subscription information. Please try again later."
        />
      </ContainerStyled>
    );
  }

  return (
    <ContainerStyled>
      <Space direction="vertical" size={32}>
        <Space direction="vertical" size={8}>
          <Title level={2}>Your Subscription</Title>
          <Paragraph type="secondary">
            Manage your subscription plan and billing information
          </Paragraph>
        </Space>

        <CurrentPlanBanner
          subscription={subscription}
          usage={usage}
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
          onDowngrade={handleDowngrade}
          isUpgrading={isUpgrading}
          isDowngrading={isDowngrading}
        />

        <Space direction="vertical" size={16}>
          <Title level={3}>Available Plans</Title>
          <Space direction="vertical" size={24}>
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
          </Space>
        </Space>
      </Space>
    </ContainerStyled>
  );
};

export default SubscriptionPage;
