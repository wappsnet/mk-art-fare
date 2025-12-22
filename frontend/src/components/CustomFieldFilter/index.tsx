import React, { useMemo } from 'react';
import { Input, Select, Switch, Space, DatePicker } from 'antd';
import type { FieldDefinition } from '@/types/customFields';
import { FullWidthSelect, FullWidthInputNumber, ColorInput } from './styles';

interface CustomFieldFilterProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export const CustomFieldFilter: React.FC<CustomFieldFilterProps> = ({ field, value, onChange }) => {
  const filter = useMemo(() => {
    const placeholder = field.label || field.name;
    switch (field.field_type) {
      case 'select':
      case 'radio':
        if (field.options) {
          return (
            <FullWidthSelect
              placeholder={`Select ${placeholder}`}
              allowClear
              value={value}
              onChange={(val) => onChange(typeof val === 'string' ? val : '')}
            >
              {field.options.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </FullWidthSelect>
          );
        }
        return (
          <Input
            placeholder={`Enter ${placeholder}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            allowClear
          />
        );

      case 'number':
        return (
          <FullWidthInputNumber
            placeholder={`Enter ${placeholder}`}
            value={value ? Number(value) : undefined}
            onChange={(val) => onChange(val?.toString() || '')}
          />
        );

      case 'toggle':
        return (
          <Space>
            <Switch
              checked={JSON.parse(value)}
              onChange={(checked) => onChange(JSON.stringify(checked))}
            />
            <span>{value === 'true' ? 'Yes' : 'Any'}</span>
          </Space>
        );

      case 'date':
        return (
          <DatePicker
            placeholder={`Select ${placeholder}`}
            value={value}
            onChange={(date) => {
              onChange(date);
            }}
            allowClear
          />
        );

      case 'color':
        return <ColorInput type="color" value={value} onChange={(e) => onChange(e.target.value)} />;

      case 'text':
      default:
        return (
          <Input
            placeholder={`Search ${field.label || field.name}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            allowClear
          />
        );
    }
  }, [field.field_type, field.label, field.name, field.options, onChange, value]);

  return <div>{filter}</div>;
};
