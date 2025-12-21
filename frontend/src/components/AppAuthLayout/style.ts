import { Card, Layout as AntLayout } from 'antd';
import styled from '@emotion/styled';

const { Content } = AntLayout;

export const ContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  gap: 8px;
`;

export const CardStyled = styled(Card)`
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

export const LayoutStyled = styled(AntLayout)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const ContentStyled = styled(Content)`
  flex: 1;
  background: #fff;
`;
