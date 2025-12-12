import styled from '@emotion/styled';
import { Card, Typography } from 'antd';

const { Text, Title: AntTitle } = Typography;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

export const PageTitle = styled(AntTitle)`
  &.ant-typography {
    margin-bottom: 32px;
  }
`;

export const SectionCard = styled(Card)`
  margin-bottom: 24px;
`;

export const SummaryCard = styled(Card)`
  position: sticky;
  top: 80px;
`;

export const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

export const FullWidthRadioGroup = styled.div`
  width: 100%;
`;

export const FullWidthSpace = styled.div`
  width: 100%;
`;

export const AddNewAddressButton = styled.div`
  margin-top: 16px;
  padding: 0;
`;

export const UseSavedAddressButton = styled.div`
  margin-bottom: 16px;
  padding: 0;
`;

export const PaymentNotice = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
`;

export const CartItemsContainer = styled.div`
  margin-bottom: 24px;
`;

export const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const TotalLabel = styled(AntTitle)`
  &.ant-typography {
    margin: 0;
  }
`;

export const TotalAmount = styled(AntTitle)`
  &.ant-typography {
    margin: 0;
    color: #1890ff;
  }
`;

export const TermsText = styled(Text)`
  &.ant-typography {
    display: block;
    margin-top: 16px;
    font-size: 12px;
  }
`;
