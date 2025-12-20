import { Typography, Button, Space, Tag } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { CurrentPlanCardStyled } from './styles';
import type { UserSubscription, UsageStats } from '@/types/common';

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

export const CurrentPlanBanner = ({
  subscription,
  usage,
  currentPlan,
  onUpgrade,
  onDowngrade,
  isUpgrading,
  isDowngrading,
}: CurrentPlanBannerProps) => {
  return (
    <CurrentPlanCardStyled>
      <Space direction="vertical" size={16}>
        <Space>
          <Title level={3}>Current Plan</Title>
          <Tag color={currentPlan === 'pro' ? 'gold' : 'default'}>
            {subscription?.plan_name || 'Basic'}
          </Tag>
        </Space>

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
    </CurrentPlanCardStyled>
  );
};
