import { TimePicker } from 'antd';

interface TimeFieldProps {
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

export const TimeField = ({ onChange, disabled }: TimeFieldProps) => {
  return (
    <TimePicker
      onChange={(time) => onChange?.(time)}
      disabled={disabled}
      style={{ width: '100%' }}
      format="HH:mm"
    />
  );
};
