import { FC } from 'react';
import { Input } from 'antd';
import { TextFieldDefinition, TextFieldValue } from '@/types/fields';

interface TextFieldProps {
  field: TextFieldDefinition;
  fieldValue?: TextFieldValue;
  onChange: (value: TextFieldValue) => void;
  disabled?: boolean;
}

export const TextField: FC<TextFieldProps> = ({ field, fieldValue, onChange, disabled }) => {
  return (
    <Input
      placeholder={field.placeholder}
      defaultValue={field.defaultValue}
      value={field.fieldValue?.value}
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
      maxLength={field.validation?.maxLength}
    />
  );
};
