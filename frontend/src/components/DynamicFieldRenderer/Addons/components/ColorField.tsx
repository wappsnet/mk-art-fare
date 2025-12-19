import { Input, Space } from 'antd';

interface ColorFieldProps {
  value: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

export const ColorField = ({ value, onChange, disabled }: ColorFieldProps) => {
  return (
    <Space>
      <Input
        type="color"
        value={typeof value === 'string' ? value : '#000000'}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{ width: 60, padding: 4 }}
      />
      <Input
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder="#000000"
        style={{ width: 120 }}
      />
    </Space>
  );
};
