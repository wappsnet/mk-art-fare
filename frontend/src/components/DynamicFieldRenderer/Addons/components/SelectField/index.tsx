import { FC } from 'react';
import { Select } from 'antd';
import { SelectFieldDefinition, SelectFieldValue } from '@/types/fields';

interface SelectFieldProps {
  field: SelectFieldDefinition;
  onChange: (value: SelectFieldValue) => void;
  disabled?: boolean;
}

export const SelectField: FC<SelectFieldProps> = ({ field, onChange, disabled }) => {
  return (
    <Select
      placeholder={field.placeholder}
      defaultValue={field.defaultValue}
      value={field.value}
      onChange={(value) => {
        onChange({
          type: field.type,
          value,
        });
      }}
      disabled={disabled}
      options={field.options}
    />
  );
};
