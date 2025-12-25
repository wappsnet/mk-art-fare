import { CrownOutlined } from '@ant-design/icons';
import { Typography, Button, Space, Tag, Card } from 'antd';

import type { UserSubscription, UsageStats } from '@/types/subscription';

const { Title, Text, Paragraph } = Typography;

interface CurrentPlanBannerProps {
  subscription: UserSubscription | undefined;
  usage: UsageStats | undefined;
  currentPlan: string;
  onUpgrade: () => void;
  onDowngrade: () => void;
  isUpgrading: boolean;
  isDowngrading: boolean;
}

const CurrentPlanBanner = ({
  subscription,
  usage,
  currentPlan,
  onUpgrade,
  onDowngrade,
  isUpgrading,
  isDowngrading,
}: CurrentPlanBannerProps) => {
  return (
    <Card
      title={
        <Space>
          <Title level={3}>Current Plan</Title>
          <Tag color={currentPlan === 'pro' ? 'gold' : 'default'}>
            {subscription?.plan_name || 'Basic'}
          </Tag>
        </Space>
      }
    >
      <Space direction="vertical" size={16}>
        {usage && (
          <Space direction="vertical" size={8}>
            <Text>
              <strong>Usage:</strong>
            </Text>
            <Text>
              Shops: {usage.organizations.current} /{' '}
              {usage.organizations.unlimited ? 'Unlimited' : usage.organizations.max}
            </Text>
            <Text>
              Products: {usage.products.current} /{' '}
              {usage.products.unlimited ? 'Unlimited' : usage.products.max}
            </Text>
          </Space>
        )}

        <Paragraph>
          {currentPlan === 'basic'
            ? 'You are on the free Basic plan. Upgrade to Pro for unlimited features!'
            : 'You are on the Pro plan with full access to all features.'}
        </Paragraph>

        {currentPlan === 'basic' ? (
          <Button
            type="primary"
            size="large"
            icon={<CrownOutlined />}
            onClick={onUpgrade}
            loading={isUpgrading}
          >
            Upgrade to Pro
          </Button>
        ) : (
          <Button size="large" onClick={onDowngrade} loading={isDowngrading}>
            Downgrade to Basic
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default CurrentPlanBanner;
