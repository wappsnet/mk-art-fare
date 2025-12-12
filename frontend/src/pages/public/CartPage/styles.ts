import styled from '@emotion/styled';
import { Card, Typography, Row, Button } from 'antd';

const { Text, Title: AntTitle } = Typography;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const ContentRow = styled(Row)`
  margin-top: 24px;
`;

export const CartItemCard = styled(Card)`
  margin-bottom: 16px;

  .ant-card-body {
    padding: 16px;
  }
`;

export const ProductImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
`;

export const ProductTitle = styled(AntTitle)`
  &.ant-typography {
    margin-bottom: 4px;
  }
`;

export const SmallText = styled(Text)`
  &.ant-typography {
    font-size: 12px;
  }
`;

export const BlockText = styled(Text)`
  &.ant-typography {
    font-size: 12px;
    display: block;
  }
`;

export const PriceWrapper = styled.div`
  margin-top: 8px;
`;

export const Price = styled(Text)`
  &.ant-typography {
    font-size: 16px;
    color: #1890ff;
  }
`;

export const FreePrice = styled(Text)`
  &.ant-typography {
    font-size: 16px;
    color: #52c41a;
  }
`;

export const RightAlignCol = styled.div`
  text-align: right;
`;

export const TotalPrice = styled(Text)`
  &.ant-typography {
    font-size: 18px;
  }
`;

export const EventTicketsTitle = styled(AntTitle)<{ hasProducts: boolean }>`
  &.ant-typography {
    margin-top: ${props => props.hasProducts ? '32px' : '0'};
  }
`;

export const ClearCartButton = styled(Button)`
  margin-top: 16px;
`;

export const SummaryCard = styled(Card)`
  position: sticky;
  top: 80px;
`;

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const TotalTitle = styled(AntTitle)`
  &.ant-typography {
    color: #1890ff;
  }
`;

export const CheckoutButton = styled(Button)`
  margin-top: 24px;
`;

export const ContinueShoppingButton = styled(Button)`
  margin-top: 12px;
`;
