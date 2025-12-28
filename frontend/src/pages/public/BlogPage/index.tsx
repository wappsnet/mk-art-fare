import { FC, useState, ReactNode } from 'react';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Container,
  Grid,
  Typography,
  Avatar,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import { Link } from 'react-router';

import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import { useGetBlogPostsQuery } from '@/services/apiSlice';

const BlogPage: FC = () => {
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
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <CircularProgress size={60} />
      </Box>
    );
  } else if (posts.length === 0) {
    content = <EmptyState title="No blog posts found" description="Try adjusting your search criteria" />;
  } else {
    content = (
      <>
        <Grid container spacing={3}>
          {posts.map((post, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={post.id}>
              <Card
                component={Link}
                to={`/blog/${post.slug}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                }}
              >
                {post.featured_image_url ? (
                  <Box sx={{ position: 'relative' }}>
                    {index === 0 && (
                      <Chip
                        label="Featured"
                        color="warning"
                        size="small"
                        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                      />
                    )}
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.featured_image_url}
                      alt={post.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No Image
                    </Typography>
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                    }}
                  >
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </Typography>

                  <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={post.avatar_url}
                        sx={{ width: 20, height: 20 }}
                      >
                        <PersonIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="caption">
                        {post.first_name} {post.last_name}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarTodayIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">
                        {formatDate(post.published_at || post.created_at)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <VisibilityIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">{post.view_count} views</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination
            count={Math.ceil(total / limit)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      </>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            mb: 5,
          }}
        >
          <Typography variant="h2" gutterBottom>
            Art Blog
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 600, mx: 'auto' }}>
            Discover inspiring stories, art techniques, and insights from our vibrant community of artists
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search blog posts..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            size="medium"
          />
        </Box>

        {content}
      </Container>
    </AppLayout>
  );
};

export default BlogPage;
