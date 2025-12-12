import styled from '@emotion/styled';
import { Space } from 'antd';

export const TopSpace = styled(Space)`
  margin-bottom: 16px;
`;

export const ProductImage = styled.img`
  height: 200px;
  object-fit: cover;
`;

export const PlaceholderImage = styled.div`
  height: 200px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProductActions = styled(Space)`
  margin-top: 16px;
  width: 100%;
`;

export const FullWidthInput = styled.div`
  width: 100%;
`;
