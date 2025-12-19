import { Switch } from 'antd';

interface ToggleFieldProps {
  value: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

export const ToggleField = ({ value, onChange, disabled }: ToggleFieldProps) => {
  return (
    <Switch
      checked={typeof value === 'boolean' ? value : false}
      onChange={(checked) => onChange?.(checked)}
      disabled={disabled}
    />
  );
};
