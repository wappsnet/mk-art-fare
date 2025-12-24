import { FC } from 'react';
import { InputNumber } from 'antd';
import { NumberFieldDefinition, NumberFieldValue } from '@/types/fields';

interface NumberFieldProps {
  field: NumberFieldDefinition;
  onChange: (value: NumberFieldValue) => void;
  disabled?: boolean;
}

export const NumberField: FC<NumberFieldProps> = ({ field, onChange, disabled }) => {
  return (
    <InputNumber
      placeholder={field.placeholder}
      defaultValue={field.defaultValue}
      value={field.value}
      onChange={(value) => {
        if (value !== null) {
          onChange({
            value,
            type: field.type,
          });
        }
      }}
      disabled={disabled}
      min={field.validation?.min}
      max={field.validation?.max}
      step={field.validation?.step}
    />
  );
};
