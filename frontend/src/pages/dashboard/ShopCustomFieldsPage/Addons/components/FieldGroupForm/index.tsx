import { FC } from 'react';

import { TextField, Stack } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface FieldGroupFormValues {
  name: string;
  description?: string;
}

const FieldGroupForm: FC = () => {
  const { control } = useFormContext<FieldGroupFormValues>();

  return (
    <Stack spacing={3}>
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Group name is required' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Group Name"
            placeholder="e.g., Product Specifications"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            placeholder="Describe what this field group is for"
            multiline
            rows={3}
            fullWidth
          />
        )}
      />
    </Stack>
  );
};

export default FieldGroupForm;
