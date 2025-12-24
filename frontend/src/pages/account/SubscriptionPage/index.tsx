import { Typography, Space, Modal, message, Spin, Alert } from 'antd';
import {
  useGetCurrentSubscriptionQuery,
  useUpgradeSubscriptionMutation,
  useDowngradeSubscriptionMutation,
} from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { ContainerStyled } from './styles';
import { CurrentPlanBanner } from './CurrentPlanBanner';
import { PlanCard } from './PlanCard';
import { subscriptionPlans } from './subscriptionPlans';
import { createElement } from 'react';

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
          <ul>
            <li>Unlimited shops</li>
            <li>Unlimited products</li>
            <li>Advanced features</li>
            <li>Priority support</li>
          </ul>
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
          <ul>
            <li>1 shop only</li>
            <li>Up to 10 products</li>
            <li>Basic features only</li>
          </ul>
          {exceedsLimits && (
            <Alert
              type="warning"
              message="Cannot Downgrade"
              description={
                <div>
                  <p>You currently have:</p>
                  <ul>
                    <li>{orgCount} shop(s) (Basic allows 1)</li>
                    <li>{productCount} product(s) (Basic allows 10)</li>
                  </ul>
                  <p>Please delete extra shops or products before downgrading.</p>
                </div>
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
        <div>
          <Title level={2}>Your Subscription</Title>
          <Paragraph type="secondary">
            Manage your subscription plan and billing information
          </Paragraph>
        </div>

        <CurrentPlanBanner
          subscription={subscription}
          usage={usage}
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
          onDowngrade={handleDowngrade}
          isUpgrading={isUpgrading}
          isDowngrading={isDowngrading}
        />

        <div>
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
        </div>
      </Space>
    </ContainerStyled>
  );
};

export default SubscriptionPage;
