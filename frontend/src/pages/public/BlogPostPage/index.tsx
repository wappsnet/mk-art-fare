import { FC, useState } from 'react';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Container,
  Typography,
  Avatar,
  Divider,
  Button,
  TextField,
  Stack,
  Box,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useParams, Link } from 'react-router';

import AppLayout from '@/components/AppLayout';
import { useAppSelector } from '@/hooks/useRedux';
import { useGetBlogPostQuery } from '@/services/apiSlice';
import { withKeys } from '@/utils/arrayHelpers';
import { message } from '@/utils/notification';

interface CommentFormData {
  content: string;
}

const BlogPostPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, reset } = useForm<CommentFormData>({
    defaultValues: { content: '' },
  });
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    data: postData,
    isLoading: loading,
    refetch,
  } = useGetBlogPostQuery(slug || '', {
    skip: !slug,
  });

  const post = postData?.data;

  const onSubmitComment = async (values: CommentFormData) => {
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
        reset();
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
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <CircularProgress size={60} />
          </Box>
        </Container>
      </AppLayout>
    );
  }

  if (post === null || post === undefined) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Typography variant="h4">Blog post not found</Typography>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Home
          </MuiLink>
          <MuiLink component={Link} to="/blog" underline="hover" color="inherit">
            Blog
          </MuiLink>
          <Typography color="text.primary">{post.title}</Typography>
        </Breadcrumbs>

        {/* Featured Image */}
        {post.featured_image_url && (
          <Box
            component="img"
            src={post.featured_image_url}
            alt={post.title}
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 4,
            }}
          />
        )}

        {/* Article Header */}
        <Stack spacing={3} mb={4}>
          <Typography variant="h3">{post.title}</Typography>

          {/* Author Info */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={post.avatar_url} sx={{ width: 48, height: 48 }}>
              <PersonIcon />
            </Avatar>
            <Stack spacing={0}>
              <Typography variant="body1" fontWeight="bold">
                {post.first_name} {post.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Author
              </Typography>
            </Stack>
          </Stack>

          {/* Meta Info */}
          <Stack direction="row" spacing={3} sx={{ color: 'text.secondary' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">
                {formatDate(post.published_at || post.created_at)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <VisibilityIcon fontSize="small" />
              <Typography variant="body2">{post.view_count} views</Typography>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        {/* Content */}
        <Box sx={{ mb: 4, fontSize: 16, lineHeight: 1.8, color: 'text.primary' }}>
          {withKeys(post.content.split('\n')).map((item) => (
            <Typography key={item._key} sx={{ mb: 2 }}>
              {item.value}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ mb: 6 }} />

        {/* Comment Section */}
        <Stack spacing={4}>
          <Typography variant="h4">Comments ({post.comments?.length || 0})</Typography>

          {/* Comment Form */}
          {isAuthenticated ? (
            <Paper sx={{ p: 3 }}>
              <form onSubmit={handleSubmit(onSubmitComment)}>
                <Stack spacing={2}>
                  <Controller
                    name="content"
                    control={control}
                    rules={{ required: 'Please enter your comment' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={4}
                        placeholder="Write your comment..."
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Box>
                    <Button type="submit" variant="contained" disabled={submitting}>
                      Post Comment
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                <MuiLink component={Link} to="/login">
                  Sign in
                </MuiLink>{' '}
                to post a comment
              </Typography>
            </Paper>
          )}

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <Stack spacing={3}>
              {post.comments.map((comment) => (
                <Paper key={comment.id} sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={comment.avatar_url}>
                        <PersonIcon />
                      </Avatar>
                      <Stack spacing={0}>
                        <Typography variant="body1" fontWeight="bold">
                          {comment.first_name} {comment.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.created_at)}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="body1">{comment.content}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          )}
        </Stack>
      </Container>
    </AppLayout>
  );
};

export default BlogPostPage;
