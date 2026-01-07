import { FC } from 'react';

import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import { Chip, Stack, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router';

import AppDataTable, { Column } from '@/components/AppDataTable';
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
    <Stack spacing={3}>
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
  );
};

export default AdminPagesListPage;
