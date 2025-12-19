import { Checkbox } from 'antd';
import type { FieldOption } from '@/types/customFields';

interface CheckboxFieldProps {
  value: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  options?: FieldOption[];
}

export const CheckboxField = ({ value, onChange, disabled, options }: CheckboxFieldProps) => {
  return (
    <Checkbox.Group
      value={Array.isArray(value) ? value : []}
      onChange={(val) => onChange?.(val)}
      disabled={disabled}
      options={options?.map((opt) => ({
        label: opt.label,
        value: opt.value,
      }))}
    />
  );
};
