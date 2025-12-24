import { FC } from 'react';
import { Select } from 'antd';
import { SelectFieldDefinition, SelectFieldValue } from '@/types/fields';

interface SelectFieldProps {
  field: SelectFieldDefinition;
  fieldValue?: SelectFieldValue;
  onChange: (value: SelectFieldValue) => void;
  disabled?: boolean;
}

export const SelectField: FC<SelectFieldProps> = ({ field, fieldValue, onChange, disabled }) => {
  return (
    <Select
      placeholder={field.placeholder}
      defaultValue={field.defaultValue}
      value={field.fieldValue?.value}
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
      options={field.options}
    />
  );
};
