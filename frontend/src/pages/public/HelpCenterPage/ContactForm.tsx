import { FC, useState } from 'react';

import { Card, CardContent, CardHeader, TextField, Button, Stack } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

import { message } from '@/utils/notification';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const ContactForm: FC = () => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, reset } = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormData) => {
    setLoading(true);
    console.info(values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    message.success('Your message has been sent! We will get back to you soon.');
    reset();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader title="Send us a message" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter your name' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Name"
                  placeholder="Your name"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Please enter your email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email',
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  placeholder="your@email.com"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="message"
              control={control}
              rules={{ required: 'Please enter your message' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Message"
                  placeholder="How can we help you?"
                  multiline
                  rows={6}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              Send Message
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
