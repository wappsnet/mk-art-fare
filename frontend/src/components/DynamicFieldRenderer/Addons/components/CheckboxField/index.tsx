import { FC } from 'react';
import { Checkbox } from 'antd';
import { CheckboxFieldDefinition, CheckboxFieldValue } from '@/types/fields';

interface CheckboxFieldProps {
  field: CheckboxFieldDefinition;
  onChange: (value: CheckboxFieldValue) => void;
  disabled?: boolean;
}

export const CheckboxField: FC<CheckboxFieldProps> = ({ field, onChange, disabled }) => {
  return (
    <Checkbox.Group
      options={field.options}
      defaultValue={field.defaultValue}
      value={field.value}
      onChange={(value) => {
        onChange({
          type: field.type,
          value,
        });
      }}
      disabled={disabled}
    />
  );
};
