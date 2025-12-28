import { ChangeEvent, FC, useState } from 'react';

import PersonIcon from '@mui/icons-material/Person';
import UploadIcon from '@mui/icons-material/Upload';
import { Button, TextField, Avatar, Stack, Typography, Card, CardContent } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

import { useAppSelector } from '@/hooks/useRedux';
import { useUpdateProfileMutation, useUploadAvatarMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
}

const ProfilePage: FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url);

  const { control, handleSubmit } = useForm<ProfileFormValues>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile(values).unwrap();
      message.success('Profile updated successfully');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await uploadAvatar(formData).unwrap();
      setAvatarUrl(response.data?.avatar_url);
      message.success('Avatar uploaded successfully');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to upload avatar');
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={4}>
          {/* Avatar Section */}
          <Stack spacing={2} alignItems="center">
            <Avatar src={avatarUrl} sx={{ width: 100, height: 100 }}>
              <PersonIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={isUploading}
            >
              {'Change Avatar'}
              <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
            </Button>
          </Stack>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Typography variant="h6">Personal Information</Typography>

              <Controller
                name="first_name"
                control={control}
                rules={{ required: 'Please enter your first name' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    placeholder="John"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="last_name"
                control={control}
                rules={{ required: 'Please enter your last name' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    placeholder="Doe"
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
                    placeholder="john.doe@example.com"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    placeholder="+1 (555) 123-4567"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              <Button type="submit" variant="contained" disabled={isLoading}>
                Save Changes
              </Button>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProfilePage;
