import styled from '@emotion/styled';
import { Card, Space } from 'antd';

export const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
`;

export const FormCard = styled(Card)`
  max-width: 450px;
  width: 100%;
`;

export const CenteredContent = styled.div`
  text-align: center;
`;

export const FullWidthSpace = styled(Space)`
  width: 100%;
`;
