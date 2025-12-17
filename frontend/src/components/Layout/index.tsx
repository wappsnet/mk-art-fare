import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContentStyled, LayoutStyled } from './style.ts';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <LayoutStyled theme="light">
      <Header />
      <ContentStyled>{children}</ContentStyled>
      <Footer />
    </LayoutStyled>
  );
};
