import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Tag, Avatar, Spin, Empty, Pagination, Input } from 'antd';
import { UserOutlined, EyeOutlined, CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { Layout } from '@/components/Layout';
import { useGetBlogPostsQuery } from '@/services/apiSlice';
import { BlogPost } from '../types';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
`;

const PostCard = styled(Card)`
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

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #666;
`;

const FeaturedBadge = styled(Tag)`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
`;

export const BlogPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 9;

  const { data: blogData, isLoading: loading } = useGetBlogPostsQuery({
    search,
    page,
    limit,
  });

  const posts = blogData?.data?.posts || [];
  const total = blogData?.data?.total || 0;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <Container>
        <HeroSection>
          <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
            Art Blog
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 18,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Discover inspiring stories, art techniques, and insights from our vibrant community of
            artists
          </Paragraph>
        </HeroSection>

        <div style={{ marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
          <Search
            placeholder="Search blog posts..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : posts.length === 0 ? (
          <Empty description="No blog posts found" />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {posts.map((post, index) => (
                <Col xs={24} sm={12} lg={8} key={post.id}>
                  <Link to={`/blog/${post.slug}`}>
                    <PostCard
                      cover={
                        post.featured_image_url ? (
                          <div style={{ position: 'relative' }}>
                            {index === 0 && <FeaturedBadge color="gold">Featured</FeaturedBadge>}
                            <img alt={post.title} src={post.featured_image_url} />
                          </div>
                        ) : (
                          <div
                            style={{
                              height: 200,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f5f5f5',
                            }}
                          >
                            <Text type="secondary">No Image</Text>
                          </div>
                        )
                      }
                    >
                      <Title level={4} ellipsis={{ rows: 2 }}>
                        {post.title}
                      </Title>
                      <Paragraph ellipsis={{ rows: 3 }} type="secondary">
                        {post.excerpt || post.content.substring(0, 150) + '...'}
                      </Paragraph>

                      <PostMeta>
                        <span>
                          <Avatar size="small" src={post.avatar_url} icon={<UserOutlined />} />
                          <Text style={{ marginLeft: 8 }}>
                            {post.first_name} {post.last_name}
                          </Text>
                        </span>
                        <span>
                          <CalendarOutlined /> {formatDate(post.published_at || post.created_at)}
                        </span>
                        <span>
                          <EyeOutlined /> {post.view_count} views
                        </span>
                      </PostMeta>
                    </PostCard>
                  </Link>
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={limit}
                onChange={setPage}
                showSizeChanger={false}
                showTotal={(total) => `Total ${total} posts`}
              />
            </div>
          </>
        )}
      </Container>
    </Layout>
  );
};
