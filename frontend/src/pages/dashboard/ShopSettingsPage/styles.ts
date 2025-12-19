import styled from '@emotion/styled';
import { Card } from 'antd';

export const PageContainer = styled.div`
  padding: 24px;
`;

export const SectionCard = styled(Card)`
  margin-bottom: 24px;

  .ant-card-head {
    background: #fafafa;
  }
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

export const ColorSwatchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

export const ColorSwatch = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .color-box {
    width: 80px;
    height: 80px;
    background-color: ${props => props.$color};
    border-radius: 8px;
    border: 2px solid #d9d9d9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const ImagePreviewContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
`;

export const EmptyImageContainer = styled.div`
  padding: 40px;
  text-align: center;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
  color: #999;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }
`;

export const FullWidthSpace = styled.div`
  width: 100%;
`;

export const CenteredSpace = styled.div`
  text-align: center;
`;
