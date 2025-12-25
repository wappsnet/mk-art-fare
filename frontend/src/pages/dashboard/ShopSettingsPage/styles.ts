import styled from '@emotion/styled';
import { Card, Space } from 'antd';

export const PageContainerStyled = styled.div`
  width: 100%;
`;

export const PageContentStyled = styled(Space)`
  width: 100%;
`;

export const SectionCardStyled = styled(Card)`
  margin-bottom: 24px;
`;

export const LogoImageStyled = styled.img`
  margin-top: 16px;
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  padding: 8px;
`;

export const BannerImageStyled = styled.img`
  margin-top: 16px;
  max-width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
`;

export const ColorSwatchContainerStyled = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

export const ColorSwatchStyled = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const ImagePreviewContainerStyled = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
`;

export const EmptyImageContainerStyled = styled.div`
  text-align: center;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
  color: #999;
`;

export const FullWidthSpaceStyled = styled.div`
  width: 100%;
`;

export const CenteredSpace = styled.div`
  text-align: center;
`;
