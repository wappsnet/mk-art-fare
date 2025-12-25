import { FC } from 'react';

import { Form, Input, Switch, Radio, Checkbox, ColorPicker, FormInstance } from 'antd';

import { FieldType, FieldOption } from '@/types/fields';

import {
  FullWidthInputNumber,
  FullWidthDatePicker,
  FullWidthTimePicker,
  FullWidthSelect,
} from './styles';

const { TextArea } = Input;

interface DefaultValueFieldProps {
  selectedFieldType: FieldType;
  form: FormInstance;
}

const DefaultValueField: FC<DefaultValueFieldProps> = ({ selectedFieldType, form }) => {
  // Get options from form for fields that need them
  const options = Form.useWatch<FieldOption[]>('options', form) || [];
  // Filter out incomplete options (those being edited)
  const validOptions = options.filter((opt) => opt?.label && opt?.value);

  switch (selectedFieldType) {
    case FieldType.NUMBER:
      return (
        <Form.Item name="default_value" label="Default Value">
          <FullWidthInputNumber placeholder="Default number value" />
        </Form.Item>
      );
    case FieldType.TOGGLE:
      return (
        <Form.Item name="default_value" label="Default Value" valuePropName="checked">
          <Switch />
        </Form.Item>
      );
    case FieldType.TEXT:
      return (
        <Form.Item name="default_value" label="Default Value">
          <Input placeholder="Default value" />
        </Form.Item>
      );
    case FieldType.DATE:
      return (
        <Form.Item name="default_value" label="Default Value">
          <FullWidthDatePicker placeholder="Select default date" />
        </Form.Item>
      );
    case FieldType.TIME:
      return (
        <Form.Item name="default_value" label="Default Value">
          <FullWidthTimePicker placeholder="Select default time" />
        </Form.Item>
      );
    case FieldType.COLOR:
      return (
        <Form.Item name="default_value" label="Default Value">
          <ColorPicker showText />
        </Form.Item>
      );
    case FieldType.SELECT:
      return (
        <Form.Item name="default_value" label="Default Value">
          <FullWidthSelect
            placeholder="Select default value"
            options={validOptions.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            disabled={!validOptions.length}
          />
        </Form.Item>
      );
    case FieldType.RADIO:
      return (
        <Form.Item name="default_value" label="Default Value">
          <Radio.Group disabled={!validOptions.length}>
            {validOptions.map((opt) => (
              <Radio key={opt.value} value={opt.value}>
                {opt.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      );
    case FieldType.CHECKBOX:
      return (
        <Form.Item name="default_value" label="Default Values">
          <Checkbox.Group
            options={validOptions.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            disabled={!validOptions.length}
          />
        </Form.Item>
      );
    case FieldType.RICHTEXT:
      return (
        <Form.Item name="default_value" label="Default Value">
          <TextArea rows={3} placeholder="Default rich text content" />
        </Form.Item>
      );
    case FieldType.IMAGE:
    case FieldType.FILE:
      return (
        <Form.Item name="default_value" label="Default Value (JSON)" help="Enter as JSON array">
          <TextArea rows={2} placeholder='[{"url": "...", "name": "..."}]' />
        </Form.Item>
      );
    default:
      return null;
  }
};

export default DefaultValueField;
