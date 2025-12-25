import styled from '@emotion/styled';
import { Layout as AntLayout } from 'antd';
import { Link } from 'react-router';

const { Footer } = AntLayout;

export const FooterStyled = styled(Footer)`
  background: #001529;
  color: rgba(255, 255, 255, 0.65);
  padding: 48px 50px 24px;

  @media (max-width: 768px) {
    padding: 32px 20px 16px;
  }
`;

export const FooterSectionStyled = styled.div`
  margin-bottom: 24px;

  h3 {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
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
