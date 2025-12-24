import { FC } from 'react';
import { Input } from 'antd';
import { TextFieldDefinition, TextFieldValue } from '@/types/fields';

interface TextFieldProps {
  field: TextFieldDefinition;
  onChange: (value: TextFieldValue) => void;
  disabled?: boolean;
}

export const TextField: FC<TextFieldProps> = ({ field, onChange, disabled }) => {
  return (
    <Input
      placeholder={field.placeholder}
      defaultValue={field.defaultValue}
      value={field.value}
      onChange={(e) =>
        onChange({
          type: field.type,
          value: e.target.value,
        })
      }
      disabled={disabled}
      maxLength={field.validation?.maxLength}
    />
  );
};
