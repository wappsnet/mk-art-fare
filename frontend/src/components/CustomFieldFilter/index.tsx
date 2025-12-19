import React from 'react';
import { Input, Select, Switch, Space } from 'antd';
import type { FieldDefinition } from '@/types/customFields';
import { FullWidthSelect, FullWidthInputNumber, FullWidthDatePicker, ColorInput } from './styles';

interface CustomFieldFilterProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export const CustomFieldFilter: React.FC<CustomFieldFilterProps> = ({ field, value, onChange }) => {
  const renderFilterInput = () => {
    switch (field.field_type) {
      case 'select':
      case 'radio':
        if (field.options && Array.isArray(field.options)) {
          return (
            <FullWidthSelect
              placeholder={`Select ${field.label || field.name}`}
              allowClear
              value={value}
              onChange={(val) => onChange(val || '')}
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
            placeholder={`Enter ${field.label || field.name}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            allowClear
          />
        );

      case 'number':
        return (
          <FullWidthInputNumber
            placeholder={`Enter ${field.label || field.name}`}
            value={value ? Number(value) : undefined}
            onChange={(val) => onChange(val?.toString() || '')}
          />
        );

      case 'toggle':
        return (
          <Space>
            <Switch
              checked={value === 'true'}
              onChange={(checked) => onChange(checked ? 'true' : '')}
            />
            <span>{value === 'true' ? 'Yes' : 'Any'}</span>
          </Space>
        );

      case 'date':
        return (
          <FullWidthDatePicker
            placeholder={`Select ${field.label || field.name}`}
            value={value}
            onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
            allowClear
          />
        );

      case 'color':
        return (
          <ColorInput
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
          />
        );

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
  };

  return <div>{renderFilterInput()}</div>;
};
