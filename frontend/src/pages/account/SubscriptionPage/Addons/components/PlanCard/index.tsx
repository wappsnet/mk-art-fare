import { CheckOutlined } from '@ant-design/icons';
import { Typography, Space, Tag } from 'antd';

import { PlanCardStyled, FeatureListStyled, FeatureItemStyled, PriceStyled } from './styles';

const { Title, Text } = Typography;

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    price: string;
    period: string;
    icon: React.ReactNode;
    description: string;
    features: string[];
  };
  isCurrentPlan: boolean;
}

const PlanCard = ({ plan, isCurrentPlan }: PlanCardProps) => {
  return (
    <PlanCardStyled active={isCurrentPlan}>
      <Space direction="vertical" size={16}>
        <Space align="start" size={16}>
          <div style={{ fontSize: 32 }}>{plan.icon}</div>
          <Space direction="vertical" size={4}>
            <Space>
              <Title level={4}>{plan.name}</Title>
              {isCurrentPlan && <Tag color="blue">Current Plan</Tag>}
            </Space>
            <Text type="secondary">{plan.description}</Text>
            <PriceStyled>
              <span className="amount">{plan.price}</span>
              <span className="period">/{plan.period}</span>
            </PriceStyled>
          </Space>
        </Space>

        <FeatureListStyled>
          {plan.features.map((feature) => (
            <FeatureItemStyled key={feature}>
              <CheckOutlined />
              <span>{feature}</span>
            </FeatureItemStyled>
          ))}
        </FeatureListStyled>
      </Space>
    </PlanCardStyled>
  );
};

export default PlanCard;
