import styled from '@emotion/styled';
import { Layout as AntLayout, Space } from 'antd';
import { Link } from 'react-router';

const { Footer } = AntLayout;

export const FooterStyled = styled(Footer)`
  background: #001529;
  color: rgba(255, 255, 255, 0.65);
  padding: 50px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const FooterSectionStyled = styled(Space)`
  margin-bottom: 24px;
  color: #fff;

  h3,
  p {
    color: currentColor;
  }
`;

export const FooterLinkStyled = styled(Link)`
  display: block;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
  }
`;

export const SocialIconStyled = styled.a`
  color: rgba(255, 255, 255, 0.65);
  font-size: 20px;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
  }
`;

export const CopyrightStyled = styled.div`
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.45);
`;
