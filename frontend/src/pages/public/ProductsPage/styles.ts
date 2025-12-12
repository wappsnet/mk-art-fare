import styled from '@emotion/styled';
import { Card, Button, Typography } from 'antd';

const { Text: AntText } = Typography;

export const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const PageHeader = styled.div`
  margin-bottom: 32px;
`;

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  gap: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Sidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  height: fit-content;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FilterSection = styled.div`
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

export const PriceRangeText = styled(AntText)`
  &.ant-typography {
    font-size: 12px;
  }
`;

export const PriceSliderWrapper = styled.div`
  margin-top: 16px;
`;

export const MobileFilterButton = styled(Button)`
  display: none;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

export const ProductCard = styled(Card)`
  height: 100%;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .ant-card-cover {
    height: 250px;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

export const PlaceholderImage = styled.div`
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProductPrice = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin: 12px 0;
`;

export const ProductShop = styled(AntText)`
  display: block;
  color: #666;
  margin-bottom: 8px;
  font-size: 12px;
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const PaginationContainer = styled.div`
  text-align: center;
  margin-top: 48px;
`;
