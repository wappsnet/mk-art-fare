import { InputNumber } from 'antd';

interface NumberFieldProps {
  placeholder?: string;
  value: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberField = ({
  placeholder,
  value,
  onChange,
  disabled,
  min,
  max,
  step,
}: NumberFieldProps) => {
  return (
    <InputNumber
      placeholder={placeholder}
      value={typeof value === 'number' ? value : undefined}
      onChange={(val) => onChange?.(val)}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      style={{ width: '100%' }}
    />
  );
};
