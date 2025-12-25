import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import { Row, Col, Space } from 'antd';

import {
  CopyrightStyled,
  FooterLinkStyled,
  FooterSectionStyled,
  SocialIconStyled,
  FooterStyled,
} from './style.ts';

const AppFooter = () => {
  return (
    <FooterStyled>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={6}>
          <FooterSectionStyled>
            <h3>Art Fare</h3>
            <p>
              A comprehensive e-commerce platform connecting artists with art lovers. Discover
              amazing artworks and support talented artists.
            </p>
          </FooterSectionStyled>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <FooterSectionStyled>
            <h3>Quick Links</h3>
            <FooterLinkStyled to="/products">Browse Products</FooterLinkStyled>
            <FooterLinkStyled to="/blog">Blog</FooterLinkStyled>
            <FooterLinkStyled to="/about">About Us</FooterLinkStyled>
          </FooterSectionStyled>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <FooterSectionStyled>
            <h3>For Artists</h3>
            <FooterLinkStyled to="/register">Create Shop</FooterLinkStyled>
            <FooterLinkStyled to="/dashboard">Artist Dashboard</FooterLinkStyled>
            <FooterLinkStyled to="/help">Help Center</FooterLinkStyled>
            <FooterLinkStyled to="/pricing">Pricing</FooterLinkStyled>
          </FooterSectionStyled>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <FooterSectionStyled>
            <h3>Connect With Us</h3>
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
