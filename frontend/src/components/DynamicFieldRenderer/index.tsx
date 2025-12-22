import React, { useMemo } from 'react';
import { Form } from 'antd';
import { FieldDefinition, FieldType } from '@/types/customFields';
import { TextField } from './Addons/components/TextField';
import { NumberField } from './Addons/components/NumberField';
import { SelectField } from './Addons/components/SelectField';
import { RadioField } from './Addons/components/RadioField';
import { CheckboxField } from './Addons/components/CheckboxField';
import { ToggleField } from './Addons/components/ToggleField';
import { DateField } from './Addons/components/DateField';
import { TimeField } from './Addons/components/TimeField';
import { ColorField } from './Addons/components/ColorField';
import { RichTextField } from './Addons/components/RichTextField';
import { FileField } from './Addons/components/FileField';

interface DynamicFieldRendererProps {
  field: FieldDefinition;
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled = false,
}) => {
  const { field_type, label, placeholder, help_text, options, validation_rules } = field;

  const FieldContent = useMemo(() => {
    switch (field_type) {
      case FieldType.TEXT:
        return (
          <TextField
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            maxLength={validation_rules?.maxLength}
          />
        );

      case FieldType.NUMBER:
        return (
          <NumberField
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={validation_rules?.min}
            max={validation_rules?.max}
            step={validation_rules?.step}
          />
        );

      case FieldType.SELECT:
        return (
          <SelectField
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            options={options}
          />
        );

      case FieldType.RADIO:
        return (
          <RadioField value={value} onChange={onChange} disabled={disabled} options={options} />
        );

      case FieldType.CHECKBOX:
        return (
          <CheckboxField value={value} onChange={onChange} disabled={disabled} options={options} />
        );

      case FieldType.TOGGLE:
        return <ToggleField value={value} onChange={onChange} disabled={disabled} />;

      case FieldType.DATE:
        return <DateField onChange={onChange} disabled={disabled} />;

      case FieldType.TIME:
        return <TimeField onChange={onChange} disabled={disabled} />;

      case FieldType.COLOR:
        return <ColorField value={value} onChange={onChange} disabled={disabled} />;

      case FieldType.RICHTEXT:
        return (
          <RichTextField
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );

      case FieldType.IMAGE:
        return <FileField onChange={onChange} disabled={disabled} isImage={true} />;

      case FieldType.FILE:
        return <FileField onChange={onChange} disabled={disabled} isImage={false} />;

      default:
        return (
          <TextField
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
    }
  }, [
    field_type,
    placeholder,
    value,
    onChange,
    disabled,
    validation_rules?.maxLength,
    validation_rules?.min,
    validation_rules?.max,
    validation_rules?.step,
    options,
  ]);

  return (
    <Form.Item
      label={label}
      help={help_text}
      rules={[
        {
          required: validation_rules?.required,
          message: `${label} is required`,
        },
      ]}
      style={{ marginBottom: 16 }}
    >
      {FieldContent}
    </Form.Item>
  );
};

export default DynamicFieldRenderer;
