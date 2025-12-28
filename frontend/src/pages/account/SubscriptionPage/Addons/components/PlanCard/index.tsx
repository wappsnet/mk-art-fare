import { FC, ReactNode } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import { Typography, Stack, Chip, Card, CardContent, Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    price: string;
    period: string;
    icon: ReactNode;
    description: string;
    features: string[];
  };
  isCurrentPlan: boolean;
}

const PlanCard: FC<PlanCardProps> = ({ plan, isCurrentPlan }) => {
  return (
    <Card
      variant={isCurrentPlan ? 'elevation' : 'outlined'}
      sx={{
        ...(isCurrentPlan && {
          borderColor: 'primary.main',
          borderWidth: 2,
          borderStyle: 'solid',
        }),
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box sx={{ fontSize: 40 }}>{plan.icon}</Box>
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5">{plan.name}</Typography>
                {isCurrentPlan && <Chip label="Current Plan" color="primary" size="small" />}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {plan.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  {plan.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  /{plan.period}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <List dense disablePadding>
            {plan.features.map((feature) => (
              <ListItem key={feature} disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
