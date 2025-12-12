import { useEffect } from 'react';
import { Form, Input, Button, Typography, Divider, Space, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { useAppSelector } from '@/hooks/useRedux';
import { useRegisterMutation } from '@/services/apiSlice';
import { Layout } from '@/components/Layout';
import { getErrorMessage } from '@/types/errors';
import { RegisterFormData } from '@/types';
import { Container, StyledCard, StyledForm, GoogleButton, CenterText } from './styles';

const { Title, Text } = Typography;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: unknown) => {
    const formData = values as RegisterFormData;
    try {
      const result = await register(formData).unwrap();
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
    <Layout>
      <Container>
        <StyledCard>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <CenterText>
              <Title level={2}>Create Account</Title>
              <Text type="secondary">Join Art Fare and start your journey</Text>
            </CenterText>

            <GoogleButton icon={<GoogleOutlined />} size="large" onClick={handleGoogleLogin}>
              Continue with Google
            </GoogleButton>

            <Divider>Or register with email</Divider>

            <StyledForm name="register" layout="vertical" onFinish={onFinish} autoComplete="off">
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
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
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

              <CenterText>
                <Text type="secondary">
                  Already have an account? <Link to="/login">Sign in</Link>
                </Text>
              </CenterText>
            </StyledForm>
          </Space>
        </StyledCard>
      </Container>
    </Layout>
  );
};
