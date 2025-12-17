import styled from '@emotion/styled';
import { Space } from 'antd';

export const ContainerStyled = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

export const WelcomeSectionStyled = styled.div`
  margin-bottom: 32px;
`;

export const CreateShopSpaceStyled = styled(Space)`
  margin-bottom: 16px;
`;

export const ShopCardCoverStyled = styled.img`
  height: 150px;
  object-fit: cover;
`;

export const PlaceholderCoverStyled = styled.div`
  height: 150px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PlaceholderIconStyled = styled.span`
  font-size: 48px;
  color: #ccc;
`;

export const ShopCardActionsStyled = styled(Space)`
  margin-top: 16px;
`;
