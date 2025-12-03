import { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Alert, Space } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { login } from '../store/authSlice';
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
  max-width: 450px;
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

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    await dispatch(login(values));
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
              <Title level={2}>Welcome Back</Title>
              <Text type="secondary">Sign in to your Art Fare account</Text>
            </div>

            {error && (
              <Alert message={error} type="error" showIcon closable />
            )}

            <GoogleButton
              icon={<GoogleOutlined />}
              size="large"
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </GoogleButton>

            <Divider>Or sign in with email</Divider>

            <StyledForm
              name="login"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to="/forgot-password">
                    <Text type="secondary">Forgot password?</Text>
                  </Link>
                </div>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  Sign In
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">
                  Don't have an account?{' '}
                  <Link to="/register">Sign up</Link>
                </Text>
              </div>
            </StyledForm>
          </Space>
        </StyledCard>
      </Container>
    </Layout>
  );
};
