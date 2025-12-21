import { Typography, Button, Space, Row, Col, Tag, Flex } from 'antd';
import { CheckOutlined, CrownOutlined, StarOutlined } from '@ant-design/icons';
import AppLayout from '@/components/AppLayout';
import { useNavigate } from 'react-router';
import { useAppSelector } from '@/hooks/useRedux';
import {
  ContainerStyled,
  HeaderStyled,
  PricingCardStyled,
  FeatureListStyled,
  FeatureItemStyled,
  PriceStyled,
  HighlightedCardStyled,
} from './styles';

const { Title, Text, Paragraph } = Typography;

const PricingPage = () => {
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
      icon: <StarOutlined />,
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
      buttonType: 'default' as const,
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      icon: <CrownOutlined />,
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
      buttonType: 'primary' as const,
      popular: true,
    },
  ];

  return (
    <AppLayout>
      <ContainerStyled>
        <HeaderStyled>
          <Space direction="vertical" size={16}>
            <Title level={1}>Simple, Transparent Pricing</Title>
            <Paragraph>
              Choose the plan that works best for you. Upgrade or downgrade anytime.
            </Paragraph>
          </Space>
        </HeaderStyled>

        <Flex vertical justify="center" gap={24}>
          <Row gutter={[32, 32]} justify="center">
            {pricingPlans.map((plan) => {
              const CardComponent = plan.popular ? HighlightedCardStyled : PricingCardStyled;

              return (
                <Col key={plan.name} xs={24} sm={24} md={12} lg={10} xl={8}>
                  <CardComponent>
                    {plan.popular && (
                      <Tag color="gold" style={{ position: 'absolute', top: 16, right: 16 }}>
                        Most Popular
                      </Tag>
                    )}

                    <Space direction="vertical" size={24}>
                      <Space direction="vertical" size={8}>
                        <Space size={12}>
                          <span style={{ fontSize: 32 }}>{plan.icon}</span>
                          <Title level={2}>{plan.name}</Title>
                        </Space>
                        <Text type="secondary">{plan.description}</Text>
                      </Space>

                      <PriceStyled>
                        <span className="amount">{plan.price}</span>
                        <span className="period">/{plan.period}</span>
                      </PriceStyled>

                      <Button
                        type={plan.buttonType}
                        size="large"
                        block
                        onClick={() => handleGetStarted(plan.name.toLowerCase())}
                      >
                        {plan.buttonText}
                      </Button>

                      <FeatureListStyled>
                        {plan.features.map((feature) => (
                          <FeatureItemStyled key={feature}>
                            <CheckOutlined />
                            <span>{feature}</span>
                          </FeatureItemStyled>
                        ))}
                      </FeatureListStyled>
                    </Space>
                  </CardComponent>
                </Col>
              );
            })}
          </Row>

          <Flex vertical align="center" justify="center" gap={16}>
            <Title level={3}>Need help choosing?</Title>
            <Paragraph>
              Visit our{' '}
              <Button type="link" onClick={() => navigate('/help')}>
                Help Center
              </Button>{' '}
              or contact our support team for personalized recommendations.
            </Paragraph>
          </Flex>
        </Flex>
      </ContainerStyled>
    </AppLayout>
  );
};

export default PricingPage;
