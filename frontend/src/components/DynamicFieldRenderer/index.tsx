import { FC, useMemo } from 'react';

import { Form } from 'antd';

import { FieldDefinition, FieldType, FieldValue } from '@/types/fields';

import { CheckboxField } from './Addons/components/CheckboxField';
import { NumberField } from './Addons/components/NumberField';
import { SelectField } from './Addons/components/SelectField';
import { TextField } from './Addons/components/TextField';
import { ToggleField } from './Addons/components/ToggleField';

export interface DynamicFieldRendererProps {
  field: FieldDefinition;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}

export const DynamicFieldRenderer: FC<DynamicFieldRendererProps> = ({
  field,
  onChange,
  disabled,
}) => {
  const content = useMemo(() => {
    switch (field.type) {
      case FieldType.TEXT:
        return <TextField field={field} onChange={onChange} disabled={disabled} />;

      case FieldType.NUMBER:
        return <NumberField field={field} onChange={onChange} disabled={disabled} />;

      case FieldType.SELECT:
        return <SelectField field={field} onChange={onChange} disabled={disabled} />;

      case FieldType.CHECKBOX:
        return <CheckboxField field={field} onChange={onChange} disabled={disabled} />;

      case FieldType.TOGGLE:
        return <ToggleField field={field} onChange={onChange} disabled={disabled} />;

      default:
        return null;
    }
  }, [disabled, field, onChange]);

  return (
    <Form.Item
      label={field.label}
      help={field.helpText}
      rules={[{ required: field.required, message: `${field.label} is required` }]}
    >
      {content}
    </Form.Item>
  );
};
