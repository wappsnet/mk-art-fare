import { ReactNode } from 'react';

import { Grid, CircularProgress, Box, Pagination, Stack, Typography } from '@mui/material';

interface AppDataGridProps<T> {
  data: T[];
  isLoading?: boolean;
  emptyContent?: ReactNode;
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T) => string | number;
  // Grid layout props
  gridProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  spacing?: number;
}

const AppDataGrid = <T = unknown,>({
  data,
  isLoading = false,
  emptyContent,
  renderItem,
  getItemKey,
  gridProps = { xs: 12, sm: 6, md: 4, lg: 3 },
  pagination,
  spacing = 3,
}: AppDataGridProps<T>) => {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        {emptyContent || <Typography color="text.secondary">No data found</Typography>}
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Grid container spacing={spacing}>
        {data.map((item, index) => (
          <Grid key={getItemKey(item)} size={gridProps}>
            {renderItem(item, index)}
          </Grid>
        ))}
      </Grid>

      {pagination && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Pagination
            count={totalPages}
            page={pagination.page}
            onChange={(_, page) => pagination.onPageChange(page)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Stack>
  );
};

export default AppDataGrid;
