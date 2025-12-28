import { FC } from 'react';

import { Container, Stack, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';

const ForbiddenPage: FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center" textAlign="center" py={12}>
          <Typography variant="h1" color="error">
            403
          </Typography>
          <Typography variant="h5">
            Sorry, you are not authorized to access this page.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/')}>
            Back Home
          </Button>
        </Stack>
      </Container>
    </AppLayout>
  );
};

export default ForbiddenPage;
