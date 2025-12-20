import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';

export const ContactForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { name: string; email: string; message: string }) => {
    setLoading(true);
    console.info(values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    message.success('Your message has been sent! We will get back to you soon.');
    form.resetFields();
    setLoading(false);
  };

  return (
    <Card title="Send us a message">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input placeholder="Your name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="your@email.com" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: 'Please enter your message' }]}
        >
          <Input.TextArea rows={6} placeholder="How can we help you?" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            Send Message
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
