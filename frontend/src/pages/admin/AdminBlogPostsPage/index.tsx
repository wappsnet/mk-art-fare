import { Box, Button, Chip, Typography } from '@mui/material';

import AppDataTable from '@/components/AppDataTable';
import { useGetBlogPostsQuery } from '@/services/apiSlice.ts';

const AdminPostsPage = () => {
  const { data: posts, isLoading } = useGetBlogPostsQuery({});

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <AppDataTable
        columns={[
          {
            id: 'title',
            label: `Title`,
            render: (item) => <Typography variant="body2">{item.title}</Typography>,
          },
          {
            id: 'status',
            label: `Status`,
            render: (item) => (
              <Chip
                label={item.status}
                color={item.status === 'published' ? 'success' : 'error'}
                size="small"
              />
            ),
          },
          {
            id: 'views',
            label: `Views`,
            render: (item) => <Typography variant="body2">{item.view_count}</Typography>,
          },
          {
            id: 'actions',
            label: `Actions`,
            render: (item) => (
              <Button
                size="small"
                onClick={() => {
                  console.info(item);
                }}
              >
                Edit
              </Button>
            ),
          },
        ]}
        data={posts?.data ?? []}
        getRowKey={(post) => post.id}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default AdminPostsPage;
