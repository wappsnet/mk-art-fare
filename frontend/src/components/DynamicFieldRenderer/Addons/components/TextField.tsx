import { Input } from 'antd';

interface TextFieldProps {
  placeholder?: string;
  value: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  maxLength?: number;
}

export const TextField = ({ placeholder, value, onChange, disabled, maxLength }: TextFieldProps) => {
  return (
    <Input
      placeholder={placeholder}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      maxLength={maxLength}
    />
  );
};
