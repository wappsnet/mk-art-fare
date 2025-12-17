import styled from '@emotion/styled';
import { Card, Button, Typography } from 'antd';

const { Text: AntText } = Typography;

export const PageContainerStyled = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const PageHeaderStyled = styled.div`
  margin-bottom: 32px;
`;

export const ContainerStyled = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  gap: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const SidebarStyled = styled.div`
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  height: fit-content;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MainContentStyled = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FilterSectionStyled = styled.div`
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

// Use AntD Text directly - apply styles via props
export const PriceRangeText = AntText;
export const ProductShop = AntText;

export const PriceSliderWrapperStyled = styled.div`
  margin-top: 16px;
`;

export const MobileFilterButtonStyled = styled(Button)`
  display: none;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

export const ProductCardStyled = styled(Card)`
  height: 100%;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .ant-card-cover {
    height: 250px;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

export const PlaceholderImageStyled = styled.div`
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProductPriceStyled = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin: 12px 0;
`;

export const LoadingContainerStyled = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const PaginationContainerStyled = styled.div`
  text-align: center;
  margin-top: 48px;
`;
