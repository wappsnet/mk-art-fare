import styled from '@emotion/styled';
import { Space } from 'antd';

export const TopSpaceStyled = styled(Space)`
  margin-bottom: 16px;
`;

export const ProductImageStyled = styled.img`
  height: 200px;
  object-fit: cover;
`;

export const PlaceholderImageStyled = styled.div`
  height: 200px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProductActionsStyled = styled(Space)`
  margin-top: 16px;
  width: 100%;
`;

export const FullWidthInputStyled = styled.div`
  width: 100%;
`;
