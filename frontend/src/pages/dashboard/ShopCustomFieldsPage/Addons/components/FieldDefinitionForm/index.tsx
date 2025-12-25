import { FC, useEffect, useRef } from 'react';

import { Form, Input, Select, Switch, Divider, FormInstance } from 'antd';

import { FieldType, FieldFormValues } from '@/types/fields';

import DefaultValueField from './Addons/components/DefaultValueField';
import OptionsListField from './Addons/components/OptionsListField';
import { FullWidthInputNumber } from './styles';

const { TextArea } = Input;

interface FieldDefinitionFormProps {
  form: FormInstance;
  selectedFieldType?: FieldType;
  fieldTypeNeedsOptions: (fieldType?: FieldType) => boolean;
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
  const previousFieldType = useRef<FieldType | undefined>(selectedFieldType);

  // Clear incompatible values when field type changes
  useEffect(() => {
    if (previousFieldType.current && previousFieldType.current !== selectedFieldType) {
      // Field type changed, clear default_value
      form.setFieldValue('default_value', undefined);

      // Clear options if new type doesn't need them
      if (!needsOptions) {
        form.setFieldValue('options', undefined);
      }
    }
    previousFieldType.current = selectedFieldType;
  }, [selectedFieldType, needsOptions, form]);

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

      {needsOptions && <OptionsListField />}

      <Form.Item name="placeholder" label="Placeholder">
        <Input placeholder="Placeholder text" />
      </Form.Item>
      <Form.Item name="help_text" label="Help Text">
        <TextArea rows={2} placeholder="Additional information for users" />
      </Form.Item>

      {selectedFieldType && <DefaultValueField selectedFieldType={selectedFieldType} form={form} />}

      <Divider>Advanced Options</Divider>

      <Form.Item name="is_searchable" label="Searchable" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="is_filterable" label="Filterable" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="sort_order" label="Sort Order">
        <FullWidthInputNumber min={0} />
      </Form.Item>
    </Form>
  );
};

export default FieldDefinitionForm;
