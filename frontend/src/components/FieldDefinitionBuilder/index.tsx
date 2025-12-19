import React, { useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  List,
  InputNumber,
  message,
  Divider,
  Typography,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { FieldCard, FullWidthSpace, FieldMeta, FieldHelp } from './styles';
import {
  useGetFieldGroupQuery,
  useCreateFieldDefinitionMutation,
  useUpdateFieldDefinitionMutation,
  useDeleteFieldDefinitionMutation,
} from '@/services/apiSlice';
import {
  FieldGroup,
  FieldDefinition,
  FieldType,
  FieldDefinitionFormData,
} from '@/types/customFields';
import { getErrorMessage } from '@/types/errors';

interface FieldDefinitionBuilderProps {
  fieldGroup: FieldGroup;
  onClose: () => void;
}

interface FieldFormValues extends Omit<FieldDefinitionFormData, 'validation_rules'> {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  step?: number;
}

const FieldDefinitionBuilder: React.FC<FieldDefinitionBuilderProps> = ({ fieldGroup, onClose }) => {
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [form] = Form.useForm();
  const [fieldType, setFieldType] = useState<FieldType>(FieldType.TEXT);

  const { data: groupData, isLoading } = useGetFieldGroupQuery(fieldGroup.id);
  const [createField, { isLoading: isCreating }] = useCreateFieldDefinitionMutation();
  const [updateField, { isLoading: isUpdating }] = useUpdateFieldDefinitionMutation();
  const [deleteField] = useDeleteFieldDefinitionMutation();

  const fields = groupData?.data?.fields || [];

  const handleAddField = () => {
    setEditingField(null);
    form.resetFields();
    setFieldType(FieldType.TEXT);
    setIsFieldModalOpen(true);
  };

  const handleEditField = (field: FieldDefinition) => {
    setEditingField(field);
    setFieldType(field.field_type);
    form.setFieldsValue({
      name: field.name,
      label: field.label,
      field_type: field.field_type,
      placeholder: field.placeholder,
      help_text: field.help_text,
      default_value: field.default_value,
      options: field.options,
      is_searchable: field.is_searchable,
      is_filterable: field.is_filterable,
      required: field.validation_rules?.required,
      min: field.validation_rules?.min,
      max: field.validation_rules?.max,
      minLength: field.validation_rules?.minLength,
      maxLength: field.validation_rules?.maxLength,
    });
    setIsFieldModalOpen(true);
  };

  const handleDeleteField = async (fieldId: number) => {
    try {
      await deleteField({ fieldGroupId: fieldGroup.id, fieldId }).unwrap();
      message.success('Field deleted successfully');
    } catch (error: unknown) {
      message.error(getErrorMessage(error) || 'Failed to delete field');
    }
  };

  const handleSubmit = async (values: FieldFormValues) => {
    try {
      const fieldData: FieldDefinitionFormData = {
        name: values.name,
        label: values.label,
        field_type: values.field_type,
        placeholder: values.placeholder,
        help_text: values.help_text,
        default_value: values.default_value,
        options: values.options && Array.isArray(values.options)
          ? JSON.stringify(values.options)
          : values.options,
        is_searchable: values.is_searchable || false,
        is_filterable: values.is_filterable || false,
        sort_order: editingField?.sort_order || fields.length,
        validation_rules: {
          required: values.required,
          min: values.min,
          max: values.max,
          minLength: values.minLength,
          maxLength: values.maxLength,
        },
      };

      if (editingField) {
        await updateField({
          fieldGroupId: fieldGroup.id,
          fieldId: editingField.id,
          data: fieldData,
        }).unwrap();
        message.success('Field updated successfully');
      } else {
        await createField({
          fieldGroupId: fieldGroup.id,
          data: fieldData,
        }).unwrap();
        message.success('Field created successfully');
      }

      setIsFieldModalOpen(false);
      form.resetFields();
    } catch (error: unknown) {
      message.error(getErrorMessage(error) || 'Failed to save field');
    }
  };

  const needsOptions = [FieldType.SELECT, FieldType.RADIO, FieldType.CHECKBOX].includes(fieldType);

  return (
    <Drawer
      title={`Manage Fields - ${fieldGroup.name}`}
      open={true}
      onClose={onClose}
      width={800}
      footer={
        <Space>
          <Button onClick={onClose}>Close</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddField}>
            Add Field
          </Button>
        </Space>
      }
    >
      <List
        loading={isLoading}
        dataSource={fields}
        renderItem={(field) => (
          <FieldCard
            key={field.id}
            size="small"
            extra={
              <Space>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditField(field)}
                />
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteField(field.id)}
                />
              </Space>
            }
          >
            <FullWidthSpace direction="vertical">
              <Typography.Text>
                <strong>{field.label}</strong> ({field.name})
              </Typography.Text>
              <FieldMeta>
                Type: {field.field_type} | Searchable: {field.is_searchable ? 'Yes' : 'No'} |
                Filterable: {field.is_filterable ? 'Yes' : 'No'}
              </FieldMeta>
              {field.help_text && <FieldHelp>{field.help_text}</FieldHelp>}
            </FullWidthSpace>
          </FieldCard>
        )}
      />

      <Drawer
        title={editingField ? 'Edit Field' : 'Add Field'}
        open={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        width={700}
        footer={
          <Space>
            <Button onClick={() => setIsFieldModalOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => form.submit()} loading={isCreating || isUpdating}>
              {editingField ? 'Update Field' : 'Create Field'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="label"
            label="Label"
            rules={[{ required: true, message: 'Please enter a label' }]}
          >
            <Input placeholder="Displayed name (e.g., 'Material', 'Dimensions')" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Field Name"
            rules={[
              { required: true, message: 'Please enter a field name' },
              {
                pattern: /^[a-z_][a-z0-9_]*$/,
                message: 'Use lowercase letters, numbers, and underscores only',
              },
            ]}
          >
            <Input placeholder="machine_name (e.g., 'material', 'dimensions')" />
          </Form.Item>

          <Form.Item
            name="field_type"
            label="Field Type"
            rules={[{ required: true, message: 'Please select a field type' }]}
          >
            <Select onChange={(value) => setFieldType(value as FieldType)}>
              <Select.Option value={FieldType.TEXT}>Text</Select.Option>
              <Select.Option value={FieldType.NUMBER}>Number</Select.Option>
              <Select.Option value={FieldType.SELECT}>Select (Dropdown)</Select.Option>
              <Select.Option value={FieldType.RADIO}>Radio Buttons</Select.Option>
              <Select.Option value={FieldType.CHECKBOX}>Checkboxes</Select.Option>
              <Select.Option value={FieldType.TOGGLE}>Toggle (Yes/No)</Select.Option>
              <Select.Option value={FieldType.DATE}>Date</Select.Option>
              <Select.Option value={FieldType.TIME}>Time</Select.Option>
              <Select.Option value={FieldType.COLOR}>Color Picker</Select.Option>
              <Select.Option value={FieldType.RICHTEXT}>Rich Text</Select.Option>
              <Select.Option value={FieldType.IMAGE}>Image Upload</Select.Option>
              <Select.Option value={FieldType.FILE}>File Upload</Select.Option>
            </Select>
          </Form.Item>

          {needsOptions && (
            <Form.Item name="options" label="Options">
              <Form.List name="options">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Space key={field.key} style={{ marginBottom: 8 }}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'label']}
                          rules={[{ required: true }]}
                          noStyle
                        >
                          <Input placeholder="Label" style={{ width: 200 }} />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'value']}
                          rules={[{ required: true }]}
                          noStyle
                        >
                          <Input placeholder="Value" style={{ width: 150 }} />
                        </Form.Item>
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Option
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>
          )}

          <Form.Item name="placeholder" label="Placeholder">
            <Input placeholder="Placeholder text for the input" />
          </Form.Item>

          <Form.Item name="help_text" label="Help Text">
            <Input.TextArea rows={2} placeholder="Additional guidance for users" />
          </Form.Item>

          <Form.Item name="default_value" label="Default Value">
            <Input placeholder="Default value when creating products" />
          </Form.Item>

          <Divider>Validation</Divider>

          <Form.Item name="required" valuePropName="checked" label="Required">
            <Switch />
          </Form.Item>

          {fieldType === FieldType.NUMBER && (
            <>
              <Form.Item name="min" label="Minimum Value">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="max" label="Maximum Value">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          {fieldType === FieldType.TEXT && (
            <>
              <Form.Item name="minLength" label="Minimum Length">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="maxLength" label="Maximum Length">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          <Divider>Search & Filter</Divider>

          <Form.Item name="is_searchable" valuePropName="checked" label="Searchable">
            <Switch />
          </Form.Item>

          <Form.Item name="is_filterable" valuePropName="checked" label="Filterable">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </Drawer>
  );
};

export default FieldDefinitionBuilder;
