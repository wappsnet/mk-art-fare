import { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Alert, Space, Radio, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAppSelector } from '../hooks/useRedux';
import { useRegisterMutation } from '@/services/apiSlice';
import { Layout } from '../components/Layout';

const { Title, Text } = Typography;

const Container = styled.div`
  min-height: calc(100vh - 64px - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

const StyledForm = styled(Form)`
  margin-top: 24px;
`;

const GoogleButton = styled(Button)`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => {
    try {
      const result = await register(values).unwrap();
      if (result.success) {
        message.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      message.error(err.data?.error || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <Layout>
      <Container>
        <StyledCard>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2}>Create Account</Title>
              <Text type="secondary">Join Art Fare and start your journey</Text>
            </div>

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

              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">
                  Already have an account? <Link to="/login">Sign in</Link>
                </Text>
              </div>
            </StyledForm>
          </Space>
        </StyledCard>
      </Container>
    </Layout>
  );
};
