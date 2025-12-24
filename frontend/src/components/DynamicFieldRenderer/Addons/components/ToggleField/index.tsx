import { FC } from 'react';
import { Switch } from 'antd';
import { ToggleFieldDefinition, ToggleFieldValue } from '@/types/fields';

interface ToggleFieldProps {
  field: ToggleFieldDefinition;
  onChange: (value: ToggleFieldValue) => void;
  disabled?: boolean;
}

export const ToggleField: FC<ToggleFieldProps> = ({ field, onChange, disabled }) => {
  return (
    <Switch
      defaultChecked={field.defaultValue}
      checked={field.value}
      onChange={() => {
        onChange({
          type: field.type,
          value: !field.value,
        });
      }}
      disabled={disabled}
    />
  );
};
