import styled from '@emotion/styled';
import { Space, Typography } from 'antd';

export const FilterSectionStyled = styled.div`
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 24px;
`;

export const SearchCompactStyled = styled(Space.Compact)`
  width: 100%;
`;

export const PriceSliderWrapperStyled = styled.div`
  margin-top: 16px;
`;

export const PriceRangeText = styled(Typography.Text)`
  font-size: 12px;
`;

export const CustomFieldFilterLabelStyled = styled(Typography.Text)`
  font-size: 12px;
  display: block;
`;
