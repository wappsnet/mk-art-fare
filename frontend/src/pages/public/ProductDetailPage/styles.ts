import styled from '@emotion/styled';

export const ContainerStyled = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const ImageGalleryStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MainImageContainerStyled = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .ant-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const ThumbnailsContainerStyled = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ThumbnailStyled = styled.div<{ active: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${(props) => (props.active ? '#1890ff' : 'transparent')};
  transition: all 0.3s;

  &:hover {
    border-color: #1890ff;
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const PriceSectionStyled = styled.div`
  background: #fafafa;
  border-radius: 8px;
  margin: 24px 0;
`;

export const PriceStyled = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
`;

export const ComparePriceStyled = styled.span`
  font-size: 20px;
  color: #999;
  text-decoration: line-through;
  margin-left: 16px;
`;

export const LoadingContainerStyled = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const QuantityContainerStyled = styled.div`
  margin-bottom: 24px;
`;
