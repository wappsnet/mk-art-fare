import { ReactNode } from 'react';

import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';

import { ContentStyled, LayoutStyled } from './style.ts';


interface LayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: LayoutProps) => {
  return (
    <LayoutStyled theme="light">
      <AppHeader />
      <ContentStyled>{children}</ContentStyled>
      <AppFooter />
    </LayoutStyled>
  );
};

export default AppLayout;
