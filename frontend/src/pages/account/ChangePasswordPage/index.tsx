import { FC } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Card, CardContent, TextField, Button, Stack, Alert, InputAdornment } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

import { useChangePasswordMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

interface ChangePasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const ChangePasswordPage: FC = () => {
  const { control, handleSubmit, watch, reset } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const newPassword = watch('new_password');

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      }).unwrap();
      message.success('Password changed successfully');
      reset();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to change password');
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Alert severity="info">
            <strong>Password Requirements</strong>
            <br />
            Your password must be at least 8 characters long and contain at least one uppercase
            letter, one lowercase letter, one number, and one special character.
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller
                name="current_password"
                control={control}
                rules={{ required: 'Please enter your current password' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="Current Password"
                    placeholder="Enter current password"
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
                name="new_password"
                control={control}
                rules={{
                  required: 'Please enter a new password',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must meet requirements',
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="New Password"
                    placeholder="Enter new password"
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
                name="confirm_password"
                control={control}
                rules={{
                  required: 'Please confirm your new password',
                  validate: (value) => value === newPassword || 'Passwords do not match',
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="Confirm New Password"
                    placeholder="Confirm new password"
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

              <Button type="submit" variant="contained" disabled={isLoading}>
                Change Password
              </Button>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordPage;
