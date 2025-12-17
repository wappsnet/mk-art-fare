import { Form, Input, Button, message, Alert, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useChangePasswordMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { PasswordContainerStyled } from './styles';

interface ChangePasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const ChangePasswordPage = () => {
  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      }).unwrap();
      message.success('Password changed successfully');
      form.resetFields();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to change password');
    }
  };

  return (
    <PasswordContainerStyled>
      <Alert
        message="Password Requirements"
        description="Your password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        type="info"
        showIcon
        style={{ marginBottom: 24, maxWidth: 600 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Form.Item
            name="current_password"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter current password"
            />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 8, message: 'Password must be at least 8 characters' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'Password must meet requirements',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter new password"
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm New Password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm new password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Change Password
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </PasswordContainerStyled>
  );
};
