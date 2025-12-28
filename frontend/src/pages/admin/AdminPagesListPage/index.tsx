import { FC } from 'react';

import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Chip, Stack, Typography, Button, Box, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router';

import AppDataTable, { Column } from '@/components/AppDataTable';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import { useGetPagesQuery } from '@/services/apiSlice';
import { Page } from '@/types/common';

const AdminPagesListPage: FC = () => {
  const navigate = useNavigate();
  const { data: pagesData, isLoading } = useGetPagesQuery();

  const pages = pagesData?.data || [];

  const getPageName = (slug: string) => {
    const nameMap: Record<string, string> = {
      'help-center': 'Help Center',
      terms: 'Terms of Use',
      about: 'About Us',
      privacy: 'Privacy Policy',
    };
    return nameMap[slug] || slug;
  };

  const columns: Column<Page>[] = [
    {
      id: 'page',
      label: 'Page',
      render: (page) => (
        <Typography variant="body2" fontWeight="medium">
          {getPageName(page.slug)}
        </Typography>
      ),
    },
    {
      id: 'title',
      label: 'Title',
      render: (page) => <Typography variant="body2">{page.title}</Typography>,
    },
    {
      id: 'slug',
      label: 'Slug',
      render: (page) => (
        <Typography variant="body2" color="text.secondary">
          /{page.slug}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (page) => (
        <Chip
          label={page.is_published ? 'Published' : 'Draft'}
          color={page.is_published ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'updated_at',
      label: 'Last Updated',
      render: (page) => (
        <Typography variant="body2">{new Date(page.updated_at).toLocaleDateString()}</Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (page) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/admin/pages/${page.id}/edit`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <Box sx={{ py: 4, px: 3 }}>
        <Stack spacing={3}>
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
            <Typography
              color="text.primary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <DescriptionIcon fontSize="small" />
              Page Management
            </Typography>
          </Breadcrumbs>

          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <DescriptionIcon /> Page Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage static page content for Help Center, Terms, About, and Privacy Policy
            </Typography>
          </Box>

          <AppDataTable
            columns={columns}
            data={pages}
            isLoading={isLoading}
            getRowKey={(page) => page.id}
            emptyContent={<EmptyState icon={DescriptionIcon} title="No pages found" />}
          />
        </Stack>
      </Box>
    </AppLayout>
  );
};

export default AdminPagesListPage;
