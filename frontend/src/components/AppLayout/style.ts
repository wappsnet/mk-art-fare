import styled from '@emotion/styled';
import { Layout as AntLayout } from 'antd';

const { Content } = AntLayout;

export const LayoutStyled = styled(AntLayout)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const ContentStyled = styled(Content)`
  flex: 1;
  background: #fff;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  padding: 10px;
`;
