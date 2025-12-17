import styled from '@emotion/styled';
import { Card, Tag } from 'antd';

export const ContainerStyled = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const HeroSectionStyled = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
`;

export const PostCardStyled = styled(Card)`
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
    height: 200px;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

export const PostMetaStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #666;
`;

export const FeaturedBadgeStyled = styled(Tag)`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
`;

export const LoadingContainerStyled = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const SearchContainerStyled = styled.div`
  margin-bottom: 32px;
  max-width: 600px;
  margin: 0 auto 32px;
`;

export const PaginationContainerStyled = styled.div`
  text-align: center;
  margin-top: 48px;
`;

export const CoverWrapperStyled = styled.div`
  position: relative;
`;

export const NoImagePlaceholderStyled = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
`;
