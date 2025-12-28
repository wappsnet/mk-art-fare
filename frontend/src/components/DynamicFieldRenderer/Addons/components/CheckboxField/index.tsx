import { FC } from 'react';

import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';

import { CheckboxFieldDefinition, CheckboxFieldValue } from '@/types/fields';

interface CheckboxFieldProps {
  field: CheckboxFieldDefinition;
  fieldValue?: CheckboxFieldValue;
  onChange: (value: CheckboxFieldValue) => void;
  disabled?: boolean;
}

export const CheckboxField: FC<CheckboxFieldProps> = ({
  field,
  fieldValue,
  onChange,
  disabled,
}) => {
  const selectedValues = field.fieldValue?.value || [];

  const handleChange = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((v) => v !== optionValue);

    onChange({
      id: fieldValue?.id || 0,
      field_definition_id: field.id,
      name: field.name,
      label: field.label,
      created_at: fieldValue?.created_at,
      updated_at: fieldValue?.updated_at,
      type: field.type,
      value: newValues,
    });
  };

  return (
    <FormControl component="fieldset" fullWidth disabled={disabled}>
      <FormLabel component="legend">{field.label}</FormLabel>
      <FormGroup>
        {field.options?.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onChange={(e) => handleChange(option.value, e.target.checked)}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
      {field.helpText && <FormHelperText>{field.helpText}</FormHelperText>}
    </FormControl>
  );
};
