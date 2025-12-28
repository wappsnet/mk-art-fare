import { FC, useState } from 'react';

import EmailIcon from '@mui/icons-material/Email';
import { Typography, Button, Stack, TextField, InputAdornment, Link as MuiLink } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import AppAuthLayout from '@/components/AppAuthLayout';
import { useForgotPasswordMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const result = await forgotPassword({ email: values.email }).unwrap();
      setSubmitted(true);
      message.success(result.data?.message || 'Password reset instructions sent to your email');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <AppAuthLayout>
      <Stack spacing={3}>
        {/* Header */}
        <Stack spacing={1} textAlign="center">
          <Typography variant="h4">Forgot Password</Typography>
          {submitted ? (
            <Typography variant="body1" color="success.main">
              Check your email for password reset instructions.
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
          )}
        </Stack>

        {submitted ? (
          <Button variant="contained" onClick={() => navigate('/login')} size="large" fullWidth>
            Back to Login
          </Button>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
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
                    placeholder="your.email@example.com"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      },
                    }}
                    fullWidth
                  />
                )}
              />

              <Button type="submit" variant="contained" size="large" disabled={isLoading} fullWidth>
                Send Reset Instructions
              </Button>

              <Typography variant="body2" textAlign="center">
                Remember your password?{' '}
                <MuiLink component={Link} to="/login" underline="hover">
                  Back to Login
                </MuiLink>
              </Typography>
            </Stack>
          </form>
        )}
      </Stack>
    </AppAuthLayout>
  );
};

export default ForgotPasswordPage;
