import { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { TextField, Button, Grid, Stack, IconButton, Typography } from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { FieldFormValues } from '@/types/fields';

const OptionsListField: FC = () => {
  const { control, formState } = useFormContext<FieldFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const optionsError = formState.errors.options;

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">
        Options <span style={{ color: '#d32f2f' }}>*</span>
      </Typography>

      {fields.map((field, index) => (
        <Grid container spacing={2} key={field.id} alignItems="center">
          <Grid size={{ xs: 12, sm: 5 }}>
            <Controller
              name={`options.${index}.label`}
              control={control}
              rules={{ required: 'Label is required' }}
              render={({ field: inputField, fieldState }) => (
                <TextField
                  {...inputField}
                  placeholder="Option Label (e.g., Small)"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  size="small"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <Controller
              name={`options.${index}.value`}
              control={control}
              rules={{ required: 'Value is required' }}
              render={({ field: inputField, fieldState }) => (
                <TextField
                  {...inputField}
                  placeholder="Option Value (e.g., small)"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  size="small"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <IconButton color="error" onClick={() => remove(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => append({ label: '', value: '' })}
        fullWidth
      >
        Add Option
      </Button>

      {optionsError && typeof optionsError.message === 'string' && (
        <Typography variant="caption" color="error">
          {optionsError.message}
        </Typography>
      )}
      {fields.length === 0 && (
        <Typography variant="caption" color="error">
          Please add at least one option
        </Typography>
      )}
    </Stack>
  );
};

export default OptionsListField;
