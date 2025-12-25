import { FC } from 'react';

import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Form, Input, Button, Row, Col, Flex, Space } from 'antd';

const OptionsListField: FC = () => (
  <Space direction="vertical" style={{ width: '100%' }}>
    <Form.Item label="Options" required>
      <Form.List
        name="options"
        rules={[
          {
            validator: async (_, options) => {
              if (!options || options.length < 1) {
                throw new Error('Please add at least one option');
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <Flex vertical flex="1">
            {fields.map((field) => (
              <Row key={field.key} gutter={8}>
                <Col flex="1">
                  <Form.Item
                    {...field}
                    name={[field.name, 'label']}
                    rules={[{ required: true, message: 'Label is required' }]}
                  >
                    <Input placeholder="Option Label (e.g., Small)" />
                  </Form.Item>
                </Col>
                <Col flex="1">
                  <Form.Item
                    {...field}
                    name={[field.name, 'value']}
                    rules={[{ required: true, message: 'Value is required' }]}
                  >
                    <Input placeholder="Option Value (e.g., small)" />
                  </Form.Item>
                </Col>
                <Col>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(field.name)}
                  />
                </Col>
              </Row>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Option
              </Button>
            </Form.Item>
            <Form.ErrorList errors={errors} />
          </Flex>
        )}
      </Form.List>
    </Form.Item>
  </Space>
);

export default OptionsListField;
