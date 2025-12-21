import { Button, Row, Col, Typography, Space } from 'antd';
import { ShoppingOutlined, BankOutlined, ReadOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import AppLayout from '@/components/AppLayout';
import { withKeys } from '@/utils/arrayHelpers';
import {
  HeroSectionStyled,
  HeroTitleStyled,
  HeroTextStyled,
  BecomeArtistButtonStyled,
  SectionStyled,
  SectionHeaderStyled,
  SectionDescriptionStyled,
  FeatureCardStyled,
  IconWrapperStyled,
  StatsSectionStyled,
  StatsTitleStyled,
  StatNumberStyled,
  StatLabelStyled,
  CTASectionStyled,
  CTADescriptionStyled,
} from './styles';

const { Title, Paragraph } = Typography;

const HomePage = () => {
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
  ];

  return (
    <AppLayout>
      <HeroSectionStyled>
        <HeroTitleStyled>Welcome to Art Fare</HeroTitleStyled>
        <HeroTextStyled>
          The premier e-commerce platform connecting artists with art lovers. Discover amazing
          artworks, support talented artists, and join a vibrant community.
        </HeroTextStyled>
        <Space size="large">
          <Link to="/products">
            <Button type="primary" color="volcano" variant="solid" size="large" ghost>
              Explore Art
            </Button>
          </Link>
          <Link to="/register">
            <BecomeArtistButtonStyled size="large">Become an Artist</BecomeArtistButtonStyled>
          </Link>
        </Space>
      </HeroSectionStyled>

      <SectionStyled>
        <SectionHeaderStyled>
          <Title level={2}>Why Choose Art Fare?</Title>
          <SectionDescriptionStyled type="secondary">
            Everything you need to buy, sell, and celebrate art
          </SectionDescriptionStyled>
        </SectionHeaderStyled>

        <Row gutter={[32, 32]}>
          {withKeys(features).map((feature) => (
            <Col xs={24} sm={12} lg={8} key={feature._key}>
              <FeatureCardStyled>
                <IconWrapperStyled>{feature.icon}</IconWrapperStyled>
                <Title level={4}>{feature.title}</Title>
                <Paragraph type="secondary">{feature.description}</Paragraph>
              </FeatureCardStyled>
            </Col>
          ))}
        </Row>
      </SectionStyled>

      <StatsSectionStyled>
        <StatsTitleStyled level={2}>Our Growing Community</StatsTitleStyled>
        <Row gutter={[32, 32]}>
          {withKeys(stats).map((stat) => (
            <Col xs={12} sm={12} md={8} key={stat._key}>
              <StatNumberStyled>{stat.number}</StatNumberStyled>
              <StatLabelStyled>{stat.label}</StatLabelStyled>
            </Col>
          ))}
        </Row>
      </StatsSectionStyled>

      <SectionStyled>
        <CTASectionStyled>
          <Title level={2}>Ready to Get Started?</Title>
          <CTADescriptionStyled type="secondary">
            Join thousands of artists and art lovers on Art Fare today
          </CTADescriptionStyled>
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
        </CTASectionStyled>
      </SectionStyled>
    </AppLayout>
  );
};

export default HomePage;
