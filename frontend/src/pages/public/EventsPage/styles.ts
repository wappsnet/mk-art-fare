import styled from '@emotion/styled';
import { Card } from 'antd';

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const HeroSection = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
`;

export const FilterSection = styled.div`
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 32px;
`;

export const EventCard = styled(Card)`
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
    height: 200px;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

export const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  color: #666;
  font-size: 14px;
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const NoImagePlaceholder = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
