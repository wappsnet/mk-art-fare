import { Select } from 'antd';
import type { FieldOption } from '@/types/customFields';

interface SelectFieldProps {
  placeholder?: string;
  value: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  options?: FieldOption[];
}

export const SelectField = ({ placeholder, value, onChange, disabled, options }: SelectFieldProps) => {
  return (
    <Select
      placeholder={placeholder || 'Select an option'}
      value={typeof value === 'string' ? value : undefined}
      onChange={(val) => onChange?.(val)}
      disabled={disabled}
      options={options?.map((opt) => ({
        label: opt.label,
        value: opt.value,
      }))}
    />
  );
};
