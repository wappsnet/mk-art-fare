import { Input } from 'antd';

interface RichTextFieldProps {
  placeholder?: string;
  value: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

export const RichTextField = ({ placeholder, value, onChange, disabled }: RichTextFieldProps) => {
  return (
    <Input.TextArea
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      rows={6}
      placeholder={placeholder}
    />
  );
};
