import { FC, useRef, useEffect } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';

import AppLayout from '@/components/AppLayout';
import EditorJSComponent, { EditorJSRef } from '@/components/EditorJS';
import { useGetPageQuery, useUpdatePageMutation } from '@/services/apiSlice';
import { PageFormData } from '@/types/common';
import { message } from '@/utils/notification';

const AdminPageEditPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<EditorJSRef>(null);

  const { data: pageData, isLoading } = useGetPageQuery(Number(id));
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();

  const { control, handleSubmit, reset } = useForm<PageFormData>({
    defaultValues: {
      title: pageData?.data?.title || '',
      content: pageData?.data?.content || { blocks: [] },
      meta_description: pageData?.data?.meta_description || '',
      is_published: pageData?.data?.is_published ?? true,
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (pageData?.data) {
      reset({
        title: pageData.data.title,
        content: pageData.data.content,
        meta_description: pageData.data.meta_description || '',
        is_published: pageData.data.is_published,
      });
    }
  }, [pageData, reset]);

  const handleSave = async (data: PageFormData) => {
    if (!id) return;

    try {
      await updatePage({ id: Number(id), data }).unwrap();
      message.success('Page updated successfully');
      navigate('/admin/pages');
    } catch {
      message.error('Failed to update page');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  const page = pageData?.data;
  if (!page) {
    return (
      <AppLayout>
        <Box sx={{ py: 4, px: 3 }}>
          <Typography variant="h5" color="error">
            Page not found
          </Typography>
        </Box>
      </AppLayout>
    );
  }

  const getPageName = (slug: string) => {
    const nameMap: Record<string, string> = {
      'help-center': 'Help Center',
      terms: 'Terms of Use',
      about: 'About Us',
      privacy: 'Privacy Policy',
    };
    return nameMap[slug] || slug;
  };

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Stack spacing={4}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <MuiLink
            component={Link}
            to="/admin"
            underline="hover"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Admin Dashboard
          </MuiLink>
          <MuiLink
            component={Link}
            to="/admin/pages"
            underline="hover"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <DescriptionIcon fontSize="small" />
            Page Management
          </MuiLink>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Edit {getPageName(page.slug)}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <DescriptionIcon /> Edit {getPageName(page.slug)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Edit page content and settings
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/pages')}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Box>

        {/* Form */}
        <Card>
          <CardContent>
            <Stack spacing={4}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Page Title"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="meta_description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Meta Description"
                    multiline
                    rows={2}
                    fullWidth
                    helperText="SEO description for search engines"
                  />
                )}
              />

              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Page Content
                </Typography>
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: 'Content is required' }}
                  render={({ field }) => (
                    <EditorJSComponent
                      ref={editorRef}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Start writing your page content..."
                    />
                  )}
                />
              </Box>

              <Controller
                name="is_published"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Published"
                  />
                )}
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </form>
  );
};

export default AdminPageEditPage;
