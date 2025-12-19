import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Radio,
  Switch,
  DatePicker,
  TimePicker,
  Upload,
  Button,
  Space,
  Alert,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FieldDefinition, FieldType } from '@/types/customFields';

// Dynamic import for ReactQuill to handle when it's not installed
let ReactQuill: any = null;
try {
  ReactQuill = require('react-quill');
  require('react-quill/dist/quill.snow.css');
} catch (e) {
  console.warn('react-quill not installed. Rich text editor will not be available.');
}

interface DynamicFieldRendererProps {
  field: FieldDefinition;
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
}

const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled = false,
}) => {
  const { field_type, label, placeholder, help_text, options, validation_rules } = field;

  const renderField = () => {
    switch (field_type) {
      case FieldType.TEXT:
        return (
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            maxLength={validation_rules?.maxLength}
          />
        );

      case FieldType.NUMBER:
        return (
          <InputNumber
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={validation_rules?.min}
            max={validation_rules?.max}
            step={validation_rules?.step}
            style={{ width: '100%' }}
          />
        );

      case FieldType.SELECT:
        return (
          <Select
            placeholder={placeholder || 'Select an option'}
            value={value}
            onChange={onChange}
            disabled={disabled}
            options={options?.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
          />
        );

      case FieldType.RADIO:
        return (
          <Radio.Group value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled}>
            <Space direction="vertical">
              {options?.map((opt) => (
                <Radio key={opt.value} value={opt.value}>
                  {opt.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        );

      case FieldType.CHECKBOX:
        return (
          <Checkbox.Group
            value={value || []}
            onChange={onChange}
            disabled={disabled}
            options={options?.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
          />
        );

      case FieldType.TOGGLE:
        return (
          <Switch checked={value} onChange={onChange} disabled={disabled} />
        );

      case FieldType.DATE:
        return (
          <DatePicker
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        );

      case FieldType.TIME:
        return (
          <TimePicker
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{ width: '100%' }}
            format="HH:mm"
          />
        );

      case FieldType.COLOR:
        return (
          <Space>
            <Input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              style={{ width: 60, padding: 4 }}
            />
            <Input
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              placeholder="#000000"
              style={{ width: 120 }}
            />
          </Space>
        );

      case FieldType.RICHTEXT:
        if (ReactQuill) {
          return (
            <ReactQuill
              value={value || ''}
              onChange={onChange}
              readOnly={disabled}
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link'],
                  ['clean'],
                ],
              }}
            />
          );
        }
        return (
          <>
            <Alert
              message="Rich Text Editor Not Available"
              description="Install react-quill to use rich text fields: npm install react-quill @types/react-quill"
              type="warning"
              showIcon
              style={{ marginBottom: 8 }}
            />
            <Input.TextArea
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              rows={6}
              placeholder="Rich text editor requires react-quill package"
            />
          </>
        );

      case FieldType.IMAGE:
      case FieldType.FILE:
        return (
          <Upload
            listType={field_type === FieldType.IMAGE ? 'picture-card' : 'text'}
            fileList={value ? [value] : []}
            onChange={(info) => {
              if (info.fileList.length > 0) {
                onChange?.(info.fileList[0]);
              } else {
                onChange?.(null);
              }
            }}
            disabled={disabled}
            maxCount={1}
            beforeUpload={() => false} // Prevent auto upload
          >
            {!value && (
              <Button icon={<UploadOutlined />} disabled={disabled}>
                Upload {field_type === FieldType.IMAGE ? 'Image' : 'File'}
              </Button>
            )}
          </Upload>
        );

      default:
        return (
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

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
      {renderField()}
    </Form.Item>
  );
};

export default DynamicFieldRenderer;
