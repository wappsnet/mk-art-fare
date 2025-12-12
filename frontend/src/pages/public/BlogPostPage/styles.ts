import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const ArticleHeader = styled.div`
  margin-bottom: 32px;
`;

export const FeaturedImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 32px;
`;

export const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const MetaInfo = styled.div`
  display: flex;
  gap: 24px;
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
`;

export const Content = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: #333;

  p {
    margin-bottom: 16px;
  }
`;

export const CommentSection = styled.div`
  margin-top: 48px;
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const CommentForm = styled.div`
  margin-bottom: 32px;
`;

export const SignInPrompt = styled.div`
  margin-bottom: 32px;
`;
