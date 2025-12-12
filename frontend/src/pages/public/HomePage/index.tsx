import { Button, Row, Col, Typography, Space } from 'antd';
import { ShoppingOutlined, BankOutlined, CalendarOutlined, ReadOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { Layout } from '@/components/Layout';
import { withKeys } from '@/utils/arrayHelpers';
import {
  HeroSection,
  HeroTitle,
  HeroText,
  BecomeArtistButton,
  Section,
  SectionHeader,
  SectionDescription,
  FeatureCard,
  IconWrapper,
  StatsSection,
  StatsTitle,
  StatNumber,
  StatLabel,
  CTASection,
  CTADescription,
} from './styles';

const { Title, Paragraph } = Typography;

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
            <BecomeArtistButton size="large">Become an Artist</BecomeArtistButton>
          </Link>
        </Space>
      </HeroSection>

      <Section>
        <SectionHeader>
          <Title level={2}>Why Choose Art Fare?</Title>
          <SectionDescription type="secondary">
            Everything you need to buy, sell, and celebrate art
          </SectionDescription>
        </SectionHeader>

        <Row gutter={[32, 32]}>
          {withKeys(features).map((feature) => (
            <Col xs={24} sm={12} lg={6} key={feature._key}>
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
        <StatsTitle level={2}>Our Growing Community</StatsTitle>
        <Row gutter={[32, 32]}>
          {withKeys(stats).map((stat) => (
            <Col xs={12} sm={12} md={6} key={stat._key}>
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </Col>
          ))}
        </Row>
      </StatsSection>

      <Section>
        <CTASection>
          <Title level={2}>Ready to Get Started?</Title>
          <CTADescription type="secondary">
            Join thousands of artists and art lovers on Art Fare today
          </CTADescription>
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
        </CTASection>
      </Section>
    </Layout>
  );
};
