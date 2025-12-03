import { Layout as AntLayout, Row, Col, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, LinkedinOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

const { Footer: AntFooter } = AntLayout;

const StyledFooter = styled(AntFooter)`
  background: #001529;
  color: rgba(255, 255, 255, 0.65);
  padding: 48px 50px 24px;

  @media (max-width: 768px) {
    padding: 32px 20px 16px;
  }
`;

const FooterSection = styled.div`
  margin-bottom: 24px;

  h3 {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }
`;

const FooterLink = styled(Link)`
  display: block;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
  }
`;

const SocialIcon = styled.a`
  color: rgba(255, 255, 255, 0.65);
  font-size: 20px;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
  }
`;

const Copyright = styled.div`
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.45);
`;

export const Footer = () => {
  return (
    <StyledFooter>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={6}>
          <FooterSection>
            <h3>Art Fare</h3>
            <p>
              A comprehensive e-commerce platform connecting artists with art lovers.
              Discover amazing artworks and support talented artists.
            </p>
          </FooterSection>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <FooterSection>
            <h3>Quick Links</h3>
            <FooterLink to="/products">Browse Products</FooterLink>
            <FooterLink to="/blog">Blog</FooterLink>
            <FooterLink to="/events">Events</FooterLink>
            <FooterLink to="/about">About Us</FooterLink>
          </FooterSection>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <FooterSection>
            <h3>For Artists</h3>
            <FooterLink to="/register">Create Shop</FooterLink>
            <FooterLink to="/dashboard">Artist Dashboard</FooterLink>
            <FooterLink to="/help">Help Center</FooterLink>
            <FooterLink to="/pricing">Pricing</FooterLink>
          </FooterSection>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <FooterSection>
            <h3>Connect With Us</h3>
            <Space size="large">
              <SocialIcon href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FacebookOutlined />
              </SocialIcon>
              <SocialIcon href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <TwitterOutlined />
              </SocialIcon>
              <SocialIcon href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <InstagramOutlined />
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <LinkedinOutlined />
              </SocialIcon>
            </Space>
          </FooterSection>
        </Col>
      </Row>

      <Copyright>
        © {new Date().getFullYear()} Art Fare. All rights reserved.
      </Copyright>
    </StyledFooter>
  );
};
