import styled from '@emotion/styled';
import { Card, Typography } from 'antd';

const { Text, Title: AntTitle } = Typography;

export const ContainerStyled = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 64px - 200px);
`;

export const PageTitleStyled = styled(AntTitle)`
  &.ant-typography {
    margin-bottom: 32px;
  }
`;

export const SectionCardStyled = styled(Card)`
  margin-bottom: 24px;
`;

export const SummaryCardStyled = styled(Card)`
  position: sticky;
  top: 80px;
`;

export const CartItemStyled = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

export const FullWidthRadioGroupStyled = styled.div`
  width: 100%;
`;

export const FullWidthSpaceStyled = styled.div`
  width: 100%;
`;

export const AddNewAddressButtonStyled = styled.div`
  margin-top: 16px;
  padding: 0;
`;

export const UseSavedAddressButtonStyled = styled.div`
  margin-bottom: 16px;
  padding: 0;
`;

export const PaymentNoticeStyled = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
`;

export const CartItemsContainerStyled = styled.div`
  margin-bottom: 24px;
`;

export const PriceRowStyled = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const TotalRowStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const TotalLabelStyled = styled(AntTitle)`
  &.ant-typography {
    margin: 0;
  }
`;

export const TotalAmountStyled = styled(AntTitle)`
  &.ant-typography {
    margin: 0;
    color: #1890ff;
  }
`;

export const TermsTextStyled = styled(Text)`
  &.ant-typography {
    display: block;
    margin-top: 16px;
    font-size: 12px;
  }
`;
