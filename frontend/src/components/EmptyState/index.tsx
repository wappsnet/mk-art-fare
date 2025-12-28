import { FC, ReactNode, ComponentType } from 'react';

import InboxIcon from '@mui/icons-material/Inbox';
import { Box, Typography, SxProps, Theme } from '@mui/material';

interface EmptyStateProps {
  icon?: ComponentType<{ sx?: SxProps<Theme> }>;
  title: string;
  description?: string;
  children?: ReactNode;
}

const EmptyState: FC<EmptyStateProps> = ({
  icon: Icon = InboxIcon,
  title,
  description,
  children,
}) => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
    )}
    {children}
  </Box>
);

export default EmptyState;
