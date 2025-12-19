import { Radio, Space } from 'antd';
import type { FieldOption } from '@/types/customFields';

interface RadioFieldProps {
  value: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  options?: FieldOption[];
}

export const RadioField = ({ value, onChange, disabled, options }: RadioFieldProps) => {
  return (
    <Radio.Group
      value={typeof value === 'string' ? value : undefined}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    >
      <Space direction="vertical">
        {options?.map((opt) => (
          <Radio key={opt.value} value={opt.value}>
            {opt.label}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );
};
