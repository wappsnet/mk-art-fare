import { FC } from 'react';
import { Form, Input, FormInstance } from 'antd';

const { TextArea } = Input;

interface FieldGroupFormProps {
  form: FormInstance;
  onFinish: (values: { name: string; description?: string }) => void;
}

const FieldGroupForm: FC<FieldGroupFormProps> = ({ form, onFinish }) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="name" label="Group Name" rules={[{ required: true }]}>
        <Input placeholder="e.g., Product Specifications" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={3} placeholder="Describe what this field group is for" />
      </Form.Item>
    </Form>
  );
};

export default FieldGroupForm;
