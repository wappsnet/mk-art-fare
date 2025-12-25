import styled from '@emotion/styled';
import { Card, Typography, Row, Button, Image } from 'antd';

const { Text, Title: AntTitle } = Typography;

export const ContainerStyled = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 64px - 200px);
`;

export const LoadingContainerStyled = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const ContentRowStyled = styled(Row)`
  margin-top: 24px;
`;

export const CartItemCardStyled = styled(Card)`
  margin-bottom: 16px;
`;

export const ProductImageStyled = styled(Image)`
  object-fit: cover;
  border-radius: 4px;
`;

export const ProductTitle = AntTitle;

export const SmallTextStyled = styled(Text)`
  font-size: 12px;
`;

export const PriceStyled = styled(Text)`
  font-size: 16px;
  color: #1890ff;
`;

export const TotalPriceStyled = styled(Text)`
  font-size: 18px;
`;

export const ClearCartButtonStyled = styled(Button)`
  margin-top: 16px;
`;

export const SummaryCardStyled = styled(Card)`
  position: sticky;
  top: 80px;
`;

export const SummaryRowStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const CheckoutButtonStyled = styled(Button)`
  margin-top: 24px;
`;

export const ContinueShoppingButtonStyled = styled(Button)`
  margin-top: 12px;
`;
