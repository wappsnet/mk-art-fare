import { DatePicker } from 'antd';

interface DateFieldProps {
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

export const DateField = ({ onChange, disabled }: DateFieldProps) => {
  return (
    <DatePicker
      onChange={(date) => onChange?.(date)}
      disabled={disabled}
      style={{ width: '100%' }}
      format="YYYY-MM-DD"
    />
  );
};
