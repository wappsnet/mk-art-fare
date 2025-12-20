import styled from '@emotion/styled';
import { Card } from 'antd';

export const ContainerStyled = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
`;

export const HeaderStyled = styled.div`
  text-align: center;
  margin-bottom: 64px;
`;

export const PricingCardStyled = styled(Card)`
  height: 100%;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

export const HighlightedCardStyled = styled(PricingCardStyled)`
  border: 2px solid #1890ff;
  box-shadow: 0 8px 16px rgba(24, 144, 255, 0.2);

  &:hover {
    box-shadow: 0 12px 24px rgba(24, 144, 255, 0.3);
  }
`;

export const PriceStyled = styled.div`
  .amount {
    font-size: 48px;
    font-weight: bold;
    color: #1890ff;
  }

  .period {
    font-size: 18px;
    color: #8c8c8c;
    margin-left: 4px;
  }
`;

export const FeatureListStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FeatureItemStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;

  .anticon {
    color: #52c41a;
    font-size: 18px;
  }
`;
