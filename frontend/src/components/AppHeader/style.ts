import { Layout as AntLayout, Menu } from 'antd';
import styled from '@emotion/styled';
import { Link } from 'react-router';

const { Header: AntHeader } = AntLayout;

export const HeaderStyled = styled(AntHeader)`
  width: 100%;
  height: auto;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const LogoStyled = styled(Link)`
  font-weight: bold;
  color: #1890ff;
`;

export const NavMenuStyled = styled(Menu)`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
`;
