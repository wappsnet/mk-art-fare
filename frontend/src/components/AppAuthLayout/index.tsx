import { CardStyled, ContainerStyled, LayoutStyled } from './style.ts';
import { ReactNode } from 'react';
import { Flex, Image } from 'antd';
import { Link } from 'react-router';
import logo from '@/assets/base/logo.svg';

interface LayoutProps {
  children: ReactNode;
}

export const AppAuthLayout = ({ children }: LayoutProps) => {
  return (
    <LayoutStyled theme="light">
      <ContainerStyled>
        <Flex justify="center" align="center">
          <Link to="/">
            <Image src={logo} preview={false} />
          </Link>
        </Flex>
        <CardStyled>{children}</CardStyled>
      </ContainerStyled>
    </LayoutStyled>
  );
};

export default AppAuthLayout;
