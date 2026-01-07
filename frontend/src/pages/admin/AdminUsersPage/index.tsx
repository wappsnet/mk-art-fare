import { useState } from 'react';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';

import AppDataTable from '@/components/AppDataTable';
import { useGetUsersQuery, useUpdateUserMutation } from '@/services/apiSlice.ts';
import { UserRole } from '@/types/common.ts';
import { getErrorMessage } from '@/types/errors.ts';
import { message } from '@/utils/notification.ts';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

interface UserUpdateValues {
  role: UserRole;
  is_active: boolean;
}

const AdminUsersPage = () => {
  const [editUserModal, setEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { control, handleSubmit, reset } = useForm<UserUpdateValues>();

  const { data: users, isLoading } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    reset({
      role: user.role,
      is_active: user.is_active,
    });
    setEditUserModal(true);
  };

  const handleUpdateUser = async (values: UserUpdateValues) => {
    if (selectedUser) {
      try {
        await updateUser({
          id: selectedUser.id,
          data: {
            role: values.role,
            is_active: values.is_active,
          },
        }).unwrap();

        message.success('User updated successfully');
        setEditUserModal(false);
        reset();
      } catch (error) {
        message.error(getErrorMessage(error) || 'Failed to update user');
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <AppDataTable
        columns={[
          {
            id: 'id',
            label: `ID`,
            render: (user) => <Typography variant="body2">{user.id}</Typography>,
          },
          {
            id: 'name',
            label: `Name`,
            render: (user) => (
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            ),
          },
          {
            id: 'role',
            label: `Role`,
            render: (user) => <Chip label={user.role.toUpperCase()} color="primary" size="small" />,
          },
          {
            id: 'status',
            label: `Status`,
            render: (user) => (
              <Chip
                label={user.is_active ? 'Active' : 'Inactive'}
                color={user.is_active ? 'success' : 'error'}
                size="small"
              />
            ),
          },
          {
            id: 'joined',
            label: `Joined`,
            render: (user) => (
              <Typography variant="body2">
                {dayjs(user.created_at).format('MMM DD, YYYY')}
              </Typography>
            ),
          },
          {
            id: 'actions',
            label: `Actions`,
            render: (user) => (
              <Button size="small" onClick={() => handleEditUser(user)}>
                Edit
              </Button>
            ),
          },
        ]}
        data={users?.data ?? []}
        getRowKey={(user) => user.id}
        isLoading={isLoading}
      />

      <Dialog
        open={editUserModal}
        onClose={() => {
          setEditUserModal(false);
          reset();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <form onSubmit={handleSubmit(handleUpdateUser)}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Controller
                name="role"
                control={control}
                rules={{ required: 'Please select a role' }}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Role</InputLabel>
                    <Select {...field} label="Role">
                      <MenuItem value="customer">Customer</MenuItem>
                      <MenuItem value="artist">Artist</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="is_active"
                control={control}
                rules={{ required: 'Please select a status' }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      {...field}
                      value={field.value ? 'active' : 'inactive'}
                      onChange={(e) => field.onChange(e.target.value === 'active')}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setEditUserModal(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Update User
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminUsersPage;
