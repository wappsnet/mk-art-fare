import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const ImageGallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover .zoom-hint {
    opacity: 1;
  }
`;

export const ZoomHint = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ThumbnailsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Thumbnail = styled.div<{ active: boolean }>`
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

export const PriceSection = styled.div`
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  margin: 24px 0;
`;

export const Price = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
`;

export const ComparePrice = styled.span`
  font-size: 20px;
  color: #999;
  text-decoration: line-through;
  margin-left: 16px;
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const QuantityContainer = styled.div`
  margin-bottom: 24px;
`;
