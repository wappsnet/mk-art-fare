import styled from '@emotion/styled';
import { Card } from 'antd';

interface PlanCardProps {
  active?: boolean;
}

export const PlanCardStyled = styled(Card)<PlanCardProps>`
  border: 2px solid ${(props) => (props.active ? '#1890ff' : '#f0f0f0')};
  background: ${(props) => (props.active ? '#f6ffed' : 'white')};
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const PriceStyled = styled.div`
  .amount {
    font-size: 32px;
    font-weight: bold;
    color: #1890ff;
  }

  .period {
    font-size: 16px;
    color: #8c8c8c;
    margin-left: 4px;
  }
`;

export const FeatureListStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

export const FeatureItemStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .anticon {
    color: #52c41a;
  }
`;
