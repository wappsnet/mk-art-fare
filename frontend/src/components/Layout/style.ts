import { Layout as AntLayout } from 'antd';
import styled from '@emotion/styled';

const { Content } = AntLayout;

export const LayoutStyled = styled(AntLayout)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const ContentStyled = styled(Content)`
  flex: 1;
  background: #fff;
`;
