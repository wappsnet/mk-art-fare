import styled from '@emotion/styled';
import { Button, Flex, Layout as AntLayout, Menu } from 'antd';
import { Link } from 'react-router';

import { BREAKPOINTS } from '@/styles/breakpoints';

const { Header: AntHeader } = AntLayout;

export const HeaderStyled = styled(AntHeader)`
  width: 100%;
  height: auto;
  padding: 0 16px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (min-width: ${BREAKPOINTS.tablet}) {
    padding: 0 24px;
  }

  @media (min-width: ${BREAKPOINTS.desktop}) {
    padding: 0 48px;
  }
`;

export const LogoStyled = styled(Link)`
  font-weight: bold;
  color: #1890ff;
  display: flex;
  align-items: center;

  img {
    max-width: 120px;

    @media (min-width: ${BREAKPOINTS.tablet}) {
      max-width: 150px;
    }
  }
`;

export const NavMenuStyled = styled(Menu)`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  border-bottom: none;
`;

export const MobileMenuStyled = styled(Menu)`
  border-right: none;
`;

export const DesktopMenuContainerStyled = styled.div`
  display: none;

  @media (min-width: ${BREAKPOINTS.mobile}) {
    display: flex;
    align-items: center;
  }
`;

export const MobileMenuButtonStyled = styled(Button)`
  display: flex;

  @media (min-width: ${BREAKPOINTS.mobile}) {
    display: none;
  }
`;

export const UserMenuTriggerStyled = styled(Flex)`
  cursor: pointer;
  display: flex;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 8px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }

  span {
    display: none;

    @media (min-width: ${BREAKPOINTS.tablet}) {
      display: inline;
    }
  }
`;
