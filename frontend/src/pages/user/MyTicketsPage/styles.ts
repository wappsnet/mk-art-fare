import styled from '@emotion/styled';
import { Card, Typography } from 'antd';

const { Text, Title: AntTitle } = Typography;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const LoadingContainer = styled.div`
  text-align: 'center';
  padding: 100px 0;
`;

export const TicketCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;

  .ant-card-body {
    padding: 0;
  }
`;

export const TicketHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
`;

export const HeaderTitle = styled(AntTitle)`
  &.ant-typography {
    color: white;
    margin: 0;
  }
`;

export const TicketBody = styled.div`
  padding: 24px;
`;

export const FullWidthSpace = styled.div`
  width: 100%;
`;

export const IconWithMargin = styled.span`
  margin-right: 8px;
`;

export const TicketCode = styled.div`
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin: 16px 0;

  .code {
    font-family: 'Courier New', monospace;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 4px;
    color: #1890ff;
  }
`;

export const SmallText = styled(Text)`
  &.ant-typography {
    font-size: 12px;
  }
`;

export const DeliveryInfo = styled.div<{ color: string }>`
  background: ${(props) => props.color};
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
`;

export const DeliveryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const QRWrapper = styled.div`
  text-align: center;
  margin-top: 16px;
`;

export const QRTextWrapper = styled.div`
  margin-top: 8px;
`;

export const EmailConfirmation = styled(Text)`
  &.ant-typography {
    font-size: 12px;
    display: block;
    margin-top: 8px;
  }
`;

export const NoPaddingParagraph = styled.p`
  margin-bottom: 0;
`;

export const InfoField = styled.div`
  margin-bottom: 8px;
`;

export const BookingNumber = styled(Text)`
  &.ant-typography {
    font-size: 16px;
  }
`;

export const TotalPrice = styled(Text)`
  &.ant-typography {
    font-size: 18px;
    color: #1890ff;
  }
`;

export const BookedText = styled(Text)`
  &.ant-typography {
    font-size: 12px;
  }
`;
