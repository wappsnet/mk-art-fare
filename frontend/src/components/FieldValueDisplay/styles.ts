import styled from '@emotion/styled';

export const ColorSwatch = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  background-color: ${props => props.$color};
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: inline-block;
`;
