import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { ContentStyled, LayoutStyled } from './style.ts';
import { ReactNode } from 'react';

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
