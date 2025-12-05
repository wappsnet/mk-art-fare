import { Button, Row, Col, Card, Typography, Space } from 'antd';
import { ShoppingOutlined, BankOutlined, CalendarOutlined, ReadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { Layout } from '@/components/Layout';

const { Title, Paragraph } = Typography;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 50px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const HeroTitle = styled(Title)`
  color: white !important;
  font-size: 48px !important;
  margin-bottom: 24px !important;

  @media (max-width: 768px) {
    font-size: 32px !important;
  }
`;

const HeroText = styled(Paragraph)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const Section = styled.div`
  padding: 80px 50px;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const FeatureCard = styled(Card)`
  height: 100%;
  text-align: center;
  border-radius: 8px;
  transition:
    transform 0.3s,
    box-shadow 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: #1890ff;
  margin-bottom: 16px;
`;

const StatsSection = styled.div`
  background: #f5f5f5;
  padding: 60px 50px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #666;
`;

export const HomePage = () => {
  const features = [
    {
      icon: <ShoppingOutlined />,
      title: 'Browse Art',
      description:
        'Discover unique artworks from talented artists around the world. From paintings to sculptures, find your perfect piece.',
    },
    {
      icon: <BankOutlined />,
      title: 'Artist Shops',
      description:
        'Artists can create custom shop pages with their branding, showcase their work, and connect with art lovers.',
    },
    {
      icon: <CalendarOutlined />,
      title: 'Art Events',
      description:
        'Attend virtual and in-person art exhibitions, workshops, and events. Book tickets online with ease.',
    },
    {
      icon: <ReadOutlined />,
      title: 'Community Blog',
      description:
        'Read inspiring stories, art techniques, and industry insights from our vibrant community of artists.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Artworks' },
    { number: '2,500+', label: 'Artists' },
    { number: '50,000+', label: 'Happy Customers' },
    { number: '500+', label: 'Events Hosted' },
  ];

  return (
    <Layout>
      <HeroSection>
        <HeroTitle>Welcome to Art Fare</HeroTitle>
        <HeroText>
          The premier e-commerce platform connecting artists with art lovers. Discover amazing
          artworks, support talented artists, and join a vibrant community.
        </HeroText>
        <Space size="large">
          <Link to="/products">
            <Button type="primary" size="large" ghost>
              Explore Art
            </Button>
          </Link>
          <Link to="/register">
            <Button size="large" style={{ background: 'white', borderColor: 'white' }}>
              Become an Artist
            </Button>
          </Link>
        </Space>
      </HeroSection>

      <Section>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={2}>Why Choose Art Fare?</Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Everything you need to buy, sell, and celebrate art
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <FeatureCard>
                <IconWrapper>{feature.icon}</IconWrapper>
                <Title level={4}>{feature.title}</Title>
                <Paragraph type="secondary">{feature.description}</Paragraph>
              </FeatureCard>
            </Col>
          ))}
        </Row>
      </Section>

      <StatsSection>
        <Title level={2} style={{ marginBottom: 48 }}>
          Our Growing Community
        </Title>
        <Row gutter={[32, 32]}>
          {stats.map((stat, index) => (
            <Col xs={12} sm={12} md={6} key={index}>
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </Col>
          ))}
        </Row>
      </StatsSection>

      <Section>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Ready to Get Started?</Title>
          <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 32 }}>
            Join thousands of artists and art lovers on Art Fare today
          </Paragraph>
          <Space size="large">
            <Link to="/register">
              <Button type="primary" size="large">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/products">
              <Button size="large">Browse Gallery</Button>
            </Link>
          </Space>
        </div>
      </Section>
    </Layout>
  );
};
