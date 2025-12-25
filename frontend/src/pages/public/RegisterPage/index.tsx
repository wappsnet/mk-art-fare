import { useEffect } from 'react';

import { MailOutlined, LockOutlined, UserOutlined, GoogleOutlined } from '@ant-design/icons';
import { Form, Input, Button, Typography, Divider, Space, message } from 'antd';
import { Link, useNavigate } from 'react-router';

import AppAuthLayout from '@/components/AppAuthLayout';
import { useAppSelector } from '@/hooks/useRedux';
import { useRegisterMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';

import { GoogleButtonStyled, CenterTextStyled } from './styles';

const { Title, Text } = Typography;

interface RegisterFormValues {
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const [registerForm] = Form.useForm<RegisterFormValues>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: RegisterFormValues) => {
    try {
      const result = await register({
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
      }).unwrap();
      if (result.success) {
        message.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      message.error(getErrorMessage(err) || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    globalThis.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <AppAuthLayout>
      <Space
        direction="vertical"
        size="large"
        css={{ width: '100%' }} /* width needed for Space */
      >
        <CenterTextStyled>
          <Title level={2}>Create Account</Title>
          <Text type="secondary">Join Art Fare and start your journey</Text>
        </CenterTextStyled>

        <GoogleButtonStyled icon={<GoogleOutlined />} size="large" onClick={handleGoogleLogin}>
          Continue with Google
        </GoogleButtonStyled>

        <Divider>Or register with email</Divider>

        <Form<RegisterFormValues>
          form={registerForm}
          name="register"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="your@email.com" size="large" />
          </Form.Item>

          <Form.Item name="first_name" label="First Name">
            <Input prefix={<UserOutlined />} placeholder="John" size="large" />
          </Form.Item>

          <Form.Item name="last_name" label="Last Name">
            <Input prefix={<UserOutlined />} placeholder="Doe" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain uppercase, lowercase, and number!',
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value && getFieldValue('password') !== value) {
                    return Promise.reject(new Error('Passwords do not match!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
              Create Account
            </Button>
          </Form.Item>

          <CenterTextStyled>
            <Text type="secondary">
              Already have an account? <Link to="/login">Sign in</Link>
            </Text>
          </CenterTextStyled>
        </Form>
      </Space>
    </AppAuthLayout>
  );
};

export default RegisterPage;
