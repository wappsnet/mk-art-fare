import { FC } from 'react';
import { Checkbox } from 'antd';
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
  return (
    <Checkbox.Group
      options={field.options}
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
    />
  );
};
