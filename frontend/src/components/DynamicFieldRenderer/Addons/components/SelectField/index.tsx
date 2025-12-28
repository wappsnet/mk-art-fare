import { FC } from 'react';

import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

import { SelectFieldDefinition, SelectFieldValue } from '@/types/fields';

interface SelectFieldProps {
  field: SelectFieldDefinition;
  fieldValue?: SelectFieldValue;
  onChange: (value: SelectFieldValue) => void;
  disabled?: boolean;
}

export const SelectField: FC<SelectFieldProps> = ({ field, fieldValue, onChange, disabled }) => {
  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{field.label}</InputLabel>
      <Select
        label={field.label}
        defaultValue={field.defaultValue || ''}
        value={field.fieldValue?.value || ''}
        onChange={(e) => {
          onChange({
            id: fieldValue?.id || 0,
            field_definition_id: field.id,
            name: field.name,
            label: field.label,
            created_at: fieldValue?.created_at,
            updated_at: fieldValue?.updated_at,
            type: field.type,
            value: e.target.value,
          });
        }}
      >
        {field.options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {field.helpText && <FormHelperText>{field.helpText}</FormHelperText>}
    </FormControl>
  );
};
