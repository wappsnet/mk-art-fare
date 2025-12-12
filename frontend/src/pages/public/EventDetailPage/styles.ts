import styled from '@emotion/styled';
import { Card, Typography, InputNumber, Breadcrumb, Space, Tag } from 'antd';

const { Text } = Typography;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const EventImage = styled.div`
  width: 100%;
  height: 400px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 32px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const InfoCard = styled(Card)`
  position: sticky;
  top: 80px;
`;

export const TicketCard = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  }

  &.selected {
    border-color: #1890ff;
    background: #e6f7ff;
  }
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const StyledBreadcrumb = styled(Breadcrumb)`
  margin-bottom: 24px;
`;

export const PlaceholderImage = styled(EventImage)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EventTypeTag = styled(Tag)`
  margin-bottom: 16px;
`;

export const HostSpace = styled(Space)`
  margin-bottom: 16px;
`;

export const EventInfoSpace = styled(Space)`
  width: 100%;
`;

export const IconLarge = styled.span`
  font-size: 20px;
`;

export const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const PriceText = styled(Text)`
  color: #1890ff;
`;

export const TicketDescription = styled(Text)`
  font-size: 12px;
`;

export const TicketAvailability = styled.div`
  margin-top: 8px;
`;

export const QuantitySection = styled.div`
  margin-bottom: 16px;
`;

export const QuantityInput = styled(InputNumber)`
  margin-left: 16px;
  width: 80px;
`;

export const SubtotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const TotalText = styled(Text)`
  font-size: 18px;
`;

export const BookingSummary = styled.div`
  margin-bottom: 16px;
`;
