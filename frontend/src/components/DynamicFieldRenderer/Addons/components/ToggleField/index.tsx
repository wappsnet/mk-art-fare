import { FC } from 'react';

import { Switch } from 'antd';

import { ToggleFieldDefinition, ToggleFieldValue } from '@/types/fields';

interface ToggleFieldProps {
  field: ToggleFieldDefinition;
  fieldValue?: ToggleFieldValue;
  onChange: (value: ToggleFieldValue) => void;
  disabled?: boolean;
}

export const ToggleField: FC<ToggleFieldProps> = ({ field, fieldValue, onChange, disabled }) => {
  return (
    <Switch
      defaultChecked={field.defaultValue}
      checked={field.fieldValue?.value}
      onChange={(value) => {
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
      }}
      disabled={disabled}
    />
  );
};
