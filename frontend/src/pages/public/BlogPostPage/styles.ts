import styled from '@emotion/styled';
import { Breadcrumb, Typography } from 'antd';

const { Text } = Typography;

export const ContainerStyled = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

export const ArticleHeaderStyled = styled.div`
  margin-bottom: 32px;
`;

export const FeaturedImageStyled = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 32px;
`;

export const AuthorInfoStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const MetaInfoStyled = styled.div`
  display: flex;
  gap: 24px;
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
`;

export const ContentStyled = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: #333;

  p {
    margin-bottom: 16px;
  }
`;

export const CommentSectionStyled = styled.div`
  margin-top: 48px;
`;

export const LoadingContainerStyled = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const CommentFormStyled = styled.div`
  margin-bottom: 32px;
`;

export const SignInPromptStyled = styled.div`
  margin-bottom: 32px;
`;

export const BreadcrumbStyled = styled(Breadcrumb)`
  margin-bottom: 24px;
`;

export const SmallSecondaryTextStyled = styled(Text)`
  font-size: 12px;
`;
