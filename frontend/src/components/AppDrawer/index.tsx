import { FC, ReactNode } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Drawer, Box, Typography, IconButton } from '@mui/material';

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number | string;
}

const AppDrawer: FC<AppDrawerProps> = ({ open, onClose, title, children, footer, width = 600 }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          elevation: 2,
          sx: {
            width: { xs: '100vw', sm: width },
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }} gap={1}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body - Scrollable */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 1,
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <Box
            sx={{
              p: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default AppDrawer;
