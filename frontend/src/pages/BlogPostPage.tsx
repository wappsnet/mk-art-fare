import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Avatar,
  Divider,
  Button,
  Input,
  List,
  Form,
  message,
  Spin,
  Breadcrumb,
} from 'antd';
import { Comment as AntComment } from '@ant-design/compatible';
import { UserOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { Layout } from '../components/Layout';
import { useGetBlogPostQuery } from '@/services/apiSlice';
import { useAppSelector } from '../hooks/useRedux';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const ArticleHeader = styled.div`
  margin-bottom: 32px;
`;

const FeaturedImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 32px;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 24px;
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
`;

const Content = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: #333;

  p {
    margin-bottom: 16px;
  }
`;

const CommentSection = styled.div`
  margin-top: 48px;
`;

export const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const {
    data: postData,
    isLoading: loading,
    refetch,
  } = useGetBlogPostQuery(slug || '', {
    skip: !slug,
  });

  const post = postData?.data;

  const handleSubmitComment = async (values: { content: string }) => {
    if (!post) return;

    setSubmitting(true);
    try {
      // Note: This would need a separate mutation endpoint for blog comments
      // For now, keeping the direct API call
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/blog/${post.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        message.success('Comment added successfully!');
        form.resetFields();
        refetch(); // Refresh to get new comments
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      message.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        </Container>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <Container>
          <Title level={3}>Blog post not found</Title>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Breadcrumb
          items={[
            { title: <Link to="/">Home</Link> },
            { title: <Link to="/blog">Blog</Link> },
            { title: post.title },
          ]}
          style={{ marginBottom: 24 }}
        />

        {post.featured_image_url && (
          <FeaturedImage src={post.featured_image_url} alt={post.title} />
        )}

        <ArticleHeader>
          <Title level={1}>{post.title}</Title>

          <AuthorInfo>
            <Avatar size={48} src={post.avatar_url} icon={<UserOutlined />} />
            <div>
              <Text strong>
                {post.first_name} {post.last_name}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Author
              </Text>
            </div>
          </AuthorInfo>

          <MetaInfo>
            <span>
              <CalendarOutlined /> {formatDate(post.published_at || post.created_at)}
            </span>
            <span>
              <EyeOutlined /> {post.view_count} views
            </span>
          </MetaInfo>
        </ArticleHeader>

        <Divider />

        <Content>
          {post.content.split('\n').map((paragraph, index) => (
            <Paragraph key={index}>{paragraph}</Paragraph>
          ))}
        </Content>

        <Divider />

        <CommentSection>
          <Title level={3}>Comments ({post.comments?.length || 0})</Title>

          {isAuthenticated ? (
            <Form form={form} onFinish={handleSubmitComment} style={{ marginBottom: 32 }}>
              <Form.Item
                name="content"
                rules={[{ required: true, message: 'Please enter your comment' }]}
              >
                <TextArea rows={4} placeholder="Write your comment..." />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Post Comment
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Paragraph type="secondary" style={{ marginBottom: 32 }}>
              <Link to="/login">Sign in</Link> to post a comment
            </Paragraph>
          )}

          {post.comments && post.comments.length > 0 ? (
            <List
              dataSource={post.comments}
              renderItem={(comment) => (
                <AntComment
                  author={`${comment.first_name} ${comment.last_name}`}
                  avatar={<Avatar src={comment.avatar_url} icon={<UserOutlined />} />}
                  content={<Paragraph>{comment.content}</Paragraph>}
                  datetime={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(comment.created_at)}
                    </Text>
                  }
                />
              )}
            />
          ) : (
            <Text type="secondary">No comments yet. Be the first to comment!</Text>
          )}
        </CommentSection>
      </Container>
    </Layout>
  );
};
