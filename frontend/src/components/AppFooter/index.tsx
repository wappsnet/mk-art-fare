import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import { Row, Col, Space, Typography } from 'antd';

import {
  CopyrightStyled,
  FooterLinkStyled,
  SocialIconStyled,
  FooterStyled,
  FooterSectionStyled,
} from './styles.ts';

const { Title } = Typography;

const AppFooter = () => {
  return (
    <FooterStyled>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={6}>
          <FooterSectionStyled direction="vertical">
            <Title level={3}>Art Fare</Title>
            <p>
              A comprehensive e-commerce platform connecting artists with art lovers. Discover
              amazing artworks and support talented artists.
            </p>
          </FooterSectionStyled>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <FooterSectionStyled direction="vertical">
            <Title level={3}>Quick Links</Title>
            <FooterLinkStyled to="/products">Browse Products</FooterLinkStyled>
            <FooterLinkStyled to="/blog">Blog</FooterLinkStyled>
            <FooterLinkStyled to="/about">About Us</FooterLinkStyled>
          </FooterSectionStyled>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <FooterSectionStyled direction="vertical">
            <Title level={3}>For Artists</Title>
            <FooterLinkStyled to="/register">Create Shop</FooterLinkStyled>
            <FooterLinkStyled to="/dashboard">Artist Dashboard</FooterLinkStyled>
            <FooterLinkStyled to="/help">Help Center</FooterLinkStyled>
            <FooterLinkStyled to="/pricing">Pricing</FooterLinkStyled>
          </FooterSectionStyled>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <FooterSectionStyled direction="vertical">
            <Title level={3}>Connect With Us</Title>
            <Space size="large">
              <SocialIconStyled
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookOutlined />
              </SocialIconStyled>
              <SocialIconStyled
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterOutlined />
              </SocialIconStyled>
              <SocialIconStyled
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramOutlined />
              </SocialIconStyled>
              <SocialIconStyled
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedinOutlined />
              </SocialIconStyled>
            </Space>
          </FooterSectionStyled>
        </Col>
      </Row>

      <CopyrightStyled>© {new Date().getFullYear()} Art Fare. All rights reserved.</CopyrightStyled>
    </FooterStyled>
  );
};

export default AppFooter;
