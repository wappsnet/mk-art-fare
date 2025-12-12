import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Row, Col, Typography, Avatar, Spin, Empty, Pagination, Input } from 'antd';
import { UserOutlined, EyeOutlined, CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { useGetBlogPostsQuery } from '@/services/apiSlice';
import {
  Container,
  HeroSection,
  PostCard,
  PostMeta,
  FeaturedBadge,
  LoadingContainer,
  SearchContainer,
  PaginationContainer,
  CoverWrapper,
  NoImagePlaceholder,
} from './styles';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

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

  let content: ReactNode;
  if (loading) {
    content = (
      <LoadingContainer>
        <Spin size="large" />
      </LoadingContainer>
    );
  } else if (posts.length === 0) {
    content = <Empty description="No blog posts found" />;
  } else {
    content = (
      <>
        <Row gutter={[24, 24]}>
          {posts.map((post, index) => (
            <Col xs={24} sm={12} lg={8} key={post.id}>
              <Link to={`/blog/${post.slug}`}>
                <PostCard
                  cover={
                    post.featured_image_url ? (
                      <CoverWrapper>
                        {index === 0 && <FeaturedBadge color="gold">Featured</FeaturedBadge>}
                        <img alt={post.title} src={post.featured_image_url} />
                      </CoverWrapper>
                    ) : (
                      <NoImagePlaceholder>
                        <Text type="secondary">No Image</Text>
                      </NoImagePlaceholder>
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

        <PaginationContainer>
          <Pagination
            current={page}
            total={total}
            pageSize={limit}
            onChange={setPage}
            showSizeChanger={false}
            showTotal={(total) => `Total ${total} posts`}
          />
        </PaginationContainer>
      </>
    );
  }

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

        <SearchContainer>
          <Search
            placeholder="Search blog posts..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
          />
        </SearchContainer>

        {content}
      </Container>
    </Layout>
  );
};
