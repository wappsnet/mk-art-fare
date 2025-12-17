import styled from '@emotion/styled';

export const ImageCardStyled = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;
  }
`;

export const ImageCardContentStyled = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ThumbnailBadgeStyled = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #1890ff;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export const ImageCardFooterStyled = styled.div`
  padding: 12px;
  background: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ImageCardActionsStyled = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
`;
