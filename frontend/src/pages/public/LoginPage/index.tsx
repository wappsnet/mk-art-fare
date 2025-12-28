import { FC, useEffect } from 'react';

import EmailIcon from '@mui/icons-material/Email';
import GoogleIcon from '@mui/icons-material/Google';
import LockIcon from '@mui/icons-material/Lock';
import { Typography, Button, Divider, Stack, TextField, InputAdornment, Link as MuiLink } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import AppAuthLayout from '@/components/AppAuthLayout';
import { useAppSelector } from '@/hooks/useRedux';
import { useLoginMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors.ts';
import { message } from '@/utils/notification';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login({ email: values.email, password: values.password }).unwrap();
      if (result.success) {
        message.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      message.error(getErrorMessage(err) || 'Login failed');
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
          <Typography variant="h4">Welcome Back</Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your Art Fare account
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

        <Divider>Or sign in with email</Divider>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
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
                  placeholder="Email"
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
              name="password"
              control={control}
              rules={{ required: 'Please input your password!' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="password"
                  label="Password"
                  placeholder="Password"
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

            <MuiLink component={Link} to="/forgot-password" underline="hover" sx={{ alignSelf: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary">
                Forgot password?
              </Typography>
            </MuiLink>

            <Button type="submit" variant="contained" size="large" disabled={isLoading} fullWidth>
              Sign In
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Don't have an account?{' '}
              <MuiLink component={Link} to="/register" underline="hover">
                Sign up
              </MuiLink>
            </Typography>
          </Stack>
        </form>
      </Stack>
    </AppAuthLayout>
  );
};

export default LoginPage;
