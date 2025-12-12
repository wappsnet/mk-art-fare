import styled from '@emotion/styled';
import { Space } from 'antd';

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

export const WelcomeSection = styled.div`
  margin-bottom: 32px;
`;

export const CreateShopSpace = styled(Space)`
  margin-bottom: 16px;
`;

export const ShopCardCover = styled.img`
  height: 150px;
  object-fit: cover;
`;

export const PlaceholderCover = styled.div`
  height: 150px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PlaceholderIcon = styled.span`
  font-size: 48px;
  color: #ccc;
`;

export const ShopCardActions = styled(Space)`
  margin-top: 16px;
`;
