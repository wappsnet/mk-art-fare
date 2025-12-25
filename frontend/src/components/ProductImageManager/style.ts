import styled from '@emotion/styled';
import { Space, Card } from 'antd';

export const FullWidthSpaceStyled = styled(Space)`
  width: 100%;
`;

export const FullWidthVerticalSpaceStyled = styled(Space)`
  width: 100%;
`;

export const UploadCardStyled = styled(Card)`
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #1890ff;
  }
`;

export const DragDropSpaceStyled = styled(Space)`
  margin-bottom: 8px;
`;

export const FlexSpaceStyled = styled(Space)`
  flex: 1;
`;

export const ImageGridContainerStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

export const DragHandleSpace = styled(Space)`
  cursor: move;
`;

export const AltTextInputStyled = styled.input`
  width: 100%;
  margin-bottom: 8px;
  padding: 4px 11px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    border-color: #4096ff;
    outline: 0;
    box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  }
`;

export const AltTextDisplayStyled = styled.div<{ hasAltText: boolean }>`
  font-size: 13px;
  color: ${(props) => (props.hasAltText ? '#333' : '#999')};
  min-height: 40px;
  font-style: ${(props) => (props.hasAltText ? 'normal' : 'italic')};
`;

export const FlexButtonStyled = styled.button`
  flex: 1;
`;

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
