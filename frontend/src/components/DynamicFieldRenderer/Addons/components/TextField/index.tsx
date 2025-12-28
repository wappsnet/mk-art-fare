import { FC } from 'react';

import { TextField as MuiTextField } from '@mui/material';

import { TextFieldDefinition, TextFieldValue } from '@/types/fields';

interface TextFieldProps {
  field: TextFieldDefinition;
  fieldValue?: TextFieldValue;
  onChange: (value: TextFieldValue) => void;
  disabled?: boolean;
}

export const TextField: FC<TextFieldProps> = ({ field, fieldValue, onChange, disabled }) => {
  return (
    <MuiTextField
      placeholder={field.placeholder}
      defaultValue={field.defaultValue}
      value={field.fieldValue?.value || ''}
      onChange={(e) =>
        onChange({
          id: fieldValue?.id || 0,
          field_definition_id: field.id,
          name: field.name,
          label: field.label,
          created_at: fieldValue?.created_at,
          updated_at: fieldValue?.updated_at,
          type: field.type,
          value: e.target.value,
        })
      }
      disabled={disabled}
      slotProps={{ htmlInput: { maxLength: field.validation?.maxLength } }}
      label={field.label}
      helperText={field.helpText}
      fullWidth
    />
  );
};
