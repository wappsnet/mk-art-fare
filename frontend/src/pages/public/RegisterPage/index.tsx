import { FC, useEffect } from 'react';

import EmailIcon from '@mui/icons-material/Email';
import GoogleIcon from '@mui/icons-material/Google';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { Typography, Button, Divider, Stack, TextField, InputAdornment, Link as MuiLink } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import AppAuthLayout from '@/components/AppAuthLayout';
import { useAppSelector } from '@/hooks/useRedux';
import { useRegisterMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

interface RegisterFormValues {
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [register, { isLoading }] = useRegisterMutation();

  const { control, handleSubmit, watch } = useForm<RegisterFormValues>({
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await register({
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
      }).unwrap();
      if (result.success) {
        message.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      message.error(getErrorMessage(err) || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    globalThis.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <AppAuthLayout>
      <Stack spacing={3}>
        {/* Header */}
        <Stack spacing={1} textAlign="center">
          <Typography variant="h4">Create Account</Typography>
          <Typography variant="body1" color="text.secondary">
            Join Art Fare and start your journey
          </Typography>
        </Stack>

        {/* Google Login */}
        <Button
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          fullWidth
        >
          Continue with Google
        </Button>

        <Divider>Or register with email</Divider>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Please input your email!',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email!',
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  placeholder="your@email.com"
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

            <Controller
              name="first_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="First Name"
                  placeholder="John"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                />
              )}
            />

            <Controller
              name="last_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  placeholder="Doe"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Please input your password!',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters!',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain uppercase, lowercase, and number!',
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Please confirm your password!',
                validate: (value) =>
                  value === password || 'Passwords do not match!',
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="password"
                  label="Confirm Password"
                  placeholder="••••••••"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                />
              )}
            />

            <Button type="submit" variant="contained" size="large" disabled={isLoading} fullWidth>
              Create Account
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" underline="hover">
                Sign in
              </MuiLink>
            </Typography>
          </Stack>
        </form>
      </Stack>
    </AppAuthLayout>
  );
};

export default RegisterPage;
