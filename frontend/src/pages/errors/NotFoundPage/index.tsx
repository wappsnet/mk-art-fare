import { FC } from 'react';

import { Container, Stack, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';

const NotFoundPage: FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center" textAlign="center" py={12}>
          <Typography variant="h1" color="primary">
            404
          </Typography>
          <Typography variant="h5">
            Sorry, the page you visited does not exist.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/')}>
            Back Home
          </Button>
        </Stack>
      </Container>
    </AppLayout>
  );
};

export default NotFoundPage;
