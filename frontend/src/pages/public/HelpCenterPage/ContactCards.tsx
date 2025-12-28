import { FC } from 'react';

import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { Grid, Card, CardContent, Typography, Stack, Box } from '@mui/material';

const ContactCards: FC = () => {
  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      title: 'Email Us',
      text: 'support@artfare.com',
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: 'Call Us',
      text: '+1 (555) 123-4567',
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 40 }} />,
      title: 'Visit Us',
      text: '123 Art Street, NY 10001',
    },
  ];

  return (
    <Grid container spacing={3}>
      {contactInfo.map((item) => (
        <Grid size={{ xs: 12, sm: 4 }} key={item.title}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Box color="primary.main">{item.icon}</Box>
                <Typography variant="h5">{item.title}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {item.text}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ContactCards;
