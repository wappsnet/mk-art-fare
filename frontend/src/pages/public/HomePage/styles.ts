import styled from '@emotion/styled';
import { Card, Typography, Button } from 'antd';

const { Title: AntTitle, Paragraph: AntParagraph } = Typography;

export const HeroSectionStyled = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 50px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

export const HeroTitleStyled = styled(AntTitle)`
  color: white !important;
  font-size: 48px !important;
  margin-bottom: 24px !important;

  @media (max-width: 768px) {
    font-size: 32px !important;
  }
`;

export const HeroTextStyled = styled(AntParagraph)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

export const BecomeArtistButtonStyled = styled(Button)`
  background: white;
  border-color: white;
`;

export const SectionStyled = styled.div`
  padding: 20px;
`;

export const SectionHeaderStyled = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

export const SectionDescriptionStyled = styled(AntParagraph)`
  &.ant-typography {
    font-size: 16px;
  }
`;

export const FeatureCardStyled = styled(Card)`
  height: 100%;
  text-align: center;
  border-radius: 8px;
  transition:
    transform 0.3s,
    box-shadow 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

export const IconWrapperStyled = styled.div`
  font-size: 48px;
  color: #1890ff;
  margin-bottom: 16px;
`;

export const StatsSectionStyled = styled.div`
  background: #f5f5f5;
  padding: 20px;
  text-align: center;
`;

export const StatsTitleStyled = styled(AntTitle)`
  &.ant-typography {
    margin-bottom: 48px;
  }
`;

export const StatNumberStyled = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
`;

export const StatLabelStyled = styled.div`
  font-size: 16px;
  color: #666;
`;

export const CTASectionStyled = styled.div`
  text-align: center;
`;

export const CTADescriptionStyled = styled(AntParagraph)`
  &.ant-typography {
    font-size: 16px;
    margin-bottom: 32px;
  }
`;
