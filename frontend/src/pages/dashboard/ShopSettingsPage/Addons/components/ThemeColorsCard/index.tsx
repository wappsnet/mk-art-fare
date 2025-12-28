import { FC } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import PaletteIcon from '@mui/icons-material/Palette';
import { Button, Stack, Typography, Box, Card, CardContent, CardActions } from '@mui/material';

interface ThemeColorsCardProps {
  primaryColor?: string;
  secondaryColor?: string;
  onEdit: () => void;
}

const ThemeColorsCard: FC<ThemeColorsCardProps> = ({ primaryColor, secondaryColor, onEdit }) => (
  <Card sx={{ mt: 3 }}>
    <CardContent>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <PaletteIcon /> Theme Colors
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Customize your shop's color scheme
      </Typography>
      <Stack direction="row" spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              width: '100%',
              height: 60,
              bgcolor: primaryColor || '#1890ff',
              borderRadius: 1,
              mb: 1,
            }}
          />
          <Typography variant="subtitle2">Primary</Typography>
          <Typography variant="caption" color="text.secondary">
            {primaryColor || '#1890ff'}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              width: '100%',
              height: 60,
              bgcolor: secondaryColor || '#52c41a',
              borderRadius: 1,
              mb: 1,
            }}
          />
          <Typography variant="subtitle2">Secondary</Typography>
          <Typography variant="caption" color="text.secondary">
            {secondaryColor || '#52c41a'}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
    <CardActions>
      <Button variant="contained" startIcon={<EditIcon />} onClick={onEdit}>
        Edit
      </Button>
    </CardActions>
  </Card>
);

export default ThemeColorsCard;
