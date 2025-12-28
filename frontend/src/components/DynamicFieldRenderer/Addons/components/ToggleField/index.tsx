import { FC } from 'react';

import { FormControlLabel, Switch, FormHelperText, Box } from '@mui/material';

import { ToggleFieldDefinition, ToggleFieldValue } from '@/types/fields';

interface ToggleFieldProps {
  field: ToggleFieldDefinition;
  fieldValue?: ToggleFieldValue;
  onChange: (value: ToggleFieldValue) => void;
  disabled?: boolean;
}

export const ToggleField: FC<ToggleFieldProps> = ({ field, fieldValue, onChange, disabled }) => {
  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            defaultChecked={field.defaultValue}
            checked={field.fieldValue?.value || false}
            onChange={(e) => {
              onChange({
                id: fieldValue?.id || 0,
                field_definition_id: field.id,
                name: field.name,
                label: field.label,
                created_at: fieldValue?.created_at,
                updated_at: fieldValue?.updated_at,
                type: field.type,
                value: e.target.checked,
              });
            }}
            disabled={disabled}
          />
        }
        label={field.label}
      />
      {field.helpText && <FormHelperText>{field.helpText}</FormHelperText>}
    </Box>
  );
};
