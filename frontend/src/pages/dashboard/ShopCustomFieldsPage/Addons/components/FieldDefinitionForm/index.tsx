import { FC, useMemo } from 'react';
import { Form, Input, Select, InputNumber, Switch, Divider, FormInstance } from 'antd';
import { FieldType } from '@/types/fields';
import { FieldFormValues } from '../../types';

const { TextArea } = Input;

interface FieldDefinitionFormProps {
  form: FormInstance;
  selectedFieldType: FieldType | undefined;
  fieldTypeNeedsOptions: (fieldType: FieldType | undefined) => boolean;
  onFinish: (values: FieldFormValues) => void;
}

const FieldDefinitionForm: FC<FieldDefinitionFormProps> = ({
  form,
  selectedFieldType,
  fieldTypeNeedsOptions,
  onFinish,
}) => {
  const fieldTypeOptions = Object.values(FieldType).map((type) => ({
    label: type.charAt(0).toUpperCase() + type.slice(1),
    value: type,
  }));

  const needsOptions = fieldTypeNeedsOptions(selectedFieldType);

  const defaultValueField = useMemo(() => {
    if (!selectedFieldType) {
      return null;
    }

    switch (selectedFieldType) {
      case FieldType.NUMBER:
        return (
          <Form.Item name="default_value" label="Default Value">
            <InputNumber placeholder="Default number value" style={{ width: '100%' }} />
          </Form.Item>
        );
      case FieldType.TOGGLE:
        return (
          <Form.Item name="default_value" label="Default Value" valuePropName="checked">
            <Switch />
          </Form.Item>
        );
      case FieldType.TEXT:
      case FieldType.DATE:
      case FieldType.TIME:
      case FieldType.COLOR:
      case FieldType.SELECT:
      case FieldType.RADIO:
        return (
          <Form.Item name="default_value" label="Default Value">
            <Input placeholder="Default value" />
          </Form.Item>
        );
      case FieldType.RICHTEXT:
        return (
          <Form.Item name="default_value" label="Default Value">
            <TextArea rows={3} placeholder="Default rich text content" />
          </Form.Item>
        );
      case FieldType.CHECKBOX:
      case FieldType.IMAGE:
      case FieldType.FILE:
        return (
          <Form.Item name="default_value" label="Default Value (JSON)" help="Enter as JSON array">
            <TextArea
              rows={2}
              placeholder={
                selectedFieldType === FieldType.CHECKBOX
                  ? '["value1", "value2"]'
                  : '[{"url": "...", "name": "..."}]'
              }
            />
          </Form.Item>
        );
    }
  }, [selectedFieldType]);

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="label" label="Field Label" rules={[{ required: true }]}>
        <Input placeholder="e.g., Dimensions" />
      </Form.Item>
      <Form.Item
        name="name"
        label="Field Name (slug)"
        rules={[{ required: true }]}
        help="Unique identifier, lowercase, no spaces"
      >
        <Input placeholder="e.g., dimensions" />
      </Form.Item>
      <Form.Item name="field_type" label="Field Type" rules={[{ required: true }]}>
        <Select placeholder="Select field type" options={fieldTypeOptions} />
      </Form.Item>

      {needsOptions && (
        <Form.Item
          name="options"
          label="Options (JSON)"
          rules={[{ required: true }]}
          help='Enter as JSON array: [{"label": "Option 1", "value": "opt1"}]'
        >
          <TextArea
            rows={4}
            placeholder='[{"label": "Small", "value": "small"}, {"label": "Large", "value": "large"}]'
          />
        </Form.Item>
      )}

      <Form.Item name="placeholder" label="Placeholder">
        <Input placeholder="Placeholder text" />
      </Form.Item>
      <Form.Item name="help_text" label="Help Text">
        <TextArea rows={2} placeholder="Additional information for users" />
      </Form.Item>

      {defaultValueField}

      <Divider>Advanced Options</Divider>

      <Form.Item name="is_searchable" label="Searchable" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="is_filterable" label="Filterable" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="sort_order" label="Sort Order">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  );
};

export default FieldDefinitionForm;
