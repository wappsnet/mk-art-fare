import { FC, useEffect, useRef } from 'react';

import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { FieldType, FieldFormValues } from '@/types/fields';

import DefaultValueField from './Addons/components/DefaultValueField';
import OptionsListField from './Addons/components/OptionsListField';

interface FieldDefinitionFormProps {
  fieldTypeNeedsOptions: (fieldType?: FieldType) => boolean;
}

const FieldDefinitionForm: FC<FieldDefinitionFormProps> = ({ fieldTypeNeedsOptions }) => {
  const { control, setValue } = useFormContext<FieldFormValues>();

  const selectedFieldType = useWatch({ control, name: 'field_type' });
  const needsOptions = fieldTypeNeedsOptions(selectedFieldType);
  const previousFieldType = useRef<FieldType | undefined>(selectedFieldType);

  const fieldTypeOptions = Object.values(FieldType).map((type) => ({
    label: type.charAt(0).toUpperCase() + type.slice(1),
    value: type,
  }));

  // Clear incompatible values when field type changes
  useEffect(() => {
    if (previousFieldType.current && previousFieldType.current !== selectedFieldType) {
      // Field type changed, clear default_value
      setValue('default_value', undefined);

      // Clear options if new type doesn't need them
      if (!needsOptions) {
        setValue('options', undefined);
      }
    }
    previousFieldType.current = selectedFieldType;
  }, [selectedFieldType, needsOptions, setValue]);

  return (
    <Stack spacing={3}>
      <Controller
        name="label"
        control={control}
        rules={{ required: 'Field label is required' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Field Label"
            placeholder="e.g., Dimensions"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />

      <Controller
        name="name"
        control={control}
        rules={{ required: 'Field name is required' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Field Name (slug)"
            placeholder="e.g., dimensions"
            error={!!fieldState.error}
            helperText={fieldState.error?.message || 'Unique identifier, lowercase, no spaces'}
            fullWidth
          />
        )}
      />

      <Controller
        name="field_type"
        control={control}
        rules={{ required: 'Field type is required' }}
        render={({ field, fieldState }) => (
          <FormControl fullWidth error={!!fieldState.error}>
            <InputLabel>Field Type</InputLabel>
            <Select {...field} label="Field Type" value={field.value || ''}>
              {fieldTypeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      {needsOptions && <OptionsListField />}

      <Controller
        name="placeholder"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Placeholder" placeholder="Placeholder text" fullWidth />
        )}
      />

      <Controller
        name="help_text"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Help Text"
            multiline
            rows={2}
            placeholder="Additional information for users"
            fullWidth
          />
        )}
      />

      {selectedFieldType && <DefaultValueField selectedFieldType={selectedFieldType} />}

      <Divider>Advanced Options</Divider>

      <Controller
        name="is_searchable"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
            label="Searchable"
          />
        )}
      />

      <Controller
        name="is_filterable"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
            label="Filterable"
          />
        )}
      />

      <Controller
        name="sort_order"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Sort Order"
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            fullWidth
          />
        )}
      />
    </Stack>
  );
};

export default FieldDefinitionForm;
