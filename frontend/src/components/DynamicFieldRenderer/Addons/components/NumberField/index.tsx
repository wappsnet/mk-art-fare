import { FC } from 'react';

import { TextField } from '@mui/material';

import { NumberFieldDefinition, NumberFieldValue } from '@/types/fields';

interface NumberFieldProps {
  field: NumberFieldDefinition;
  fieldValue?: NumberFieldValue;
  onChange: (value: NumberFieldValue) => void;
  disabled?: boolean;
}

export const NumberField: FC<NumberFieldProps> = ({ field, fieldValue, onChange, disabled }) => {
  return (
    <TextField
      type="number"
      placeholder={field.placeholder}
      defaultValue={field.defaultValue}
      value={field.fieldValue?.value ?? ''}
      onChange={(e) => {
        const value = e.target.value ? Number(e.target.value) : null;
        if (value !== null) {
          onChange({
            id: fieldValue?.id || 0,
            field_definition_id: field.id,
            name: field.name,
            label: field.label,
            created_at: fieldValue?.created_at,
            updated_at: fieldValue?.updated_at,
            type: field.type,
            value,
          });
        }
      }}
      disabled={disabled}
      slotProps={{
        htmlInput: {
          min: field.validation?.min,
          max: field.validation?.max,
          step: field.validation?.step,
        },
      }}
      label={field.label}
      helperText={field.helpText}
      fullWidth
    />
  );
};
