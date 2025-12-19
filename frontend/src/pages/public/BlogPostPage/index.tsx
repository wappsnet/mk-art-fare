import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { withKeys } from '@/utils/arrayHelpers';
import { Typography, Avatar, Divider, Button, Input, List, Form, message, Spin } from 'antd';
import { Comment as AntComment } from '@ant-design/compatible';
import { UserOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { useGetBlogPostQuery } from '@/services/apiSlice';
import { useAppSelector } from '@/hooks/useRedux';
import {
  ContainerStyled,
  ArticleHeaderStyled,
  FeaturedImageStyled,
  AuthorInfoStyled,
  MetaInfoStyled,
  ContentStyled,
  CommentSectionStyled,
  LoadingContainerStyled,
  CommentFormStyled,
  SignInPromptStyled,
  BreadcrumbStyled,
  SmallSecondaryText,
} from './styles';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    data: postData,
    isLoading: loading,
    refetch,
  } = useGetBlogPostQuery(slug || '', {
    skip: !slug,
  });

  const post = postData?.data;

  const handleSubmitComment = async (values: { content: string }) => {
    if (post === null || post === undefined) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/blog/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Comment added successfully!');
        form.resetFields();
        refetch();
      } else {
        message.error('Failed to add comment');
      }
    } catch {
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
        <ContainerStyled>
          <LoadingContainerStyled>
            <Spin size="large" />
          </LoadingContainerStyled>
        </ContainerStyled>
      </Layout>
    );
  }

  if (post === null || post === undefined) {
    return (
      <Layout>
        <ContainerStyled>
          <Title level={3}>Blog post not found</Title>
        </ContainerStyled>
      </Layout>
    );
  }

  return (
    <Layout>
      <ContainerStyled>
        <BreadcrumbStyled
          items={[
            { title: <Link to="/">Home</Link> },
            { title: <Link to="/blog">Blog</Link> },
            { title: post.title },
          ]}
        />

        {post.featured_image_url && (
          <FeaturedImageStyled src={post.featured_image_url} alt={post.title} />
        )}

        <ArticleHeaderStyled>
          <Title level={1}>{post.title}</Title>

          <AuthorInfoStyled>
            <Avatar size={48} src={post.avatar_url} icon={<UserOutlined />} />
            <div>
              <Text strong>
                {post.first_name} {post.last_name}
              </Text>
              <br />
              <SmallSecondaryText type="secondary">Author</SmallSecondaryText>
            </div>
          </AuthorInfoStyled>

          <MetaInfoStyled>
            <span>
              <CalendarOutlined /> {formatDate(post.published_at || post.created_at)}
            </span>
            <span>
              <EyeOutlined /> {post.view_count} views
            </span>
          </MetaInfoStyled>
        </ArticleHeaderStyled>

        <Divider />

        <ContentStyled>
          {withKeys(post.content.split('\n')).map((item) => (
            <Paragraph key={item._key}>{item.value}</Paragraph>
          ))}
        </ContentStyled>

        <Divider />

        <CommentSectionStyled>
          <Title level={3}>Comments ({post.comments?.length || 0})</Title>

          {isAuthenticated ? (
            <CommentFormStyled>
              <Form form={form} onFinish={handleSubmitComment}>
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
            </CommentFormStyled>
          ) : (
            <SignInPromptStyled>
              <Paragraph type="secondary">
                <Link to="/login">Sign in</Link> to post a comment
              </Paragraph>
            </SignInPromptStyled>
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
                    <SmallSecondaryText type="secondary">
                      {formatDate(comment.created_at)}
                    </SmallSecondaryText>
                  }
                />
              )}
            />
          ) : (
            <Text type="secondary">No comments yet. Be the first to comment!</Text>
          )}
        </CommentSectionStyled>
      </ContainerStyled>
    </Layout>
  );
};

export default BlogPostPage;
