import styled from '@emotion/styled';
import { Card, Typography, Row, Button } from 'antd';

const { Text, Title: AntTitle } = Typography;

export const ContainerStyled = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
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

  .ant-card-body {
    padding: 16px;
  }
`;

export const ProductImageStyled = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
`;

// Simple wrappers without style overrides - using AntD theme instead
export const ProductTitle = AntTitle;
export const SmallText = Text;
export const Price = Text;
export const TotalPrice = Text;
export const TotalTitle = AntTitle;

// Only keep structural/layout styles
export const PriceWrapperStyled = styled.div`
  margin-top: 8px;
`;

export const RightAlignColStyled = styled.div`
  text-align: right;
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
