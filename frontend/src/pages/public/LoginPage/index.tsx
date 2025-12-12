import { useEffect } from 'react';
import { Input, Button, Typography, Divider, Form, message } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { useAppSelector } from '@/hooks/useRedux';
import { useLoginMutation } from '@/services/apiSlice';
import { Layout } from '@/components/Layout';
import { getErrorMessage } from '@/types/errors.ts';
import {
  Container,
  StyledCard,
  FullWidthSpace,
  HeaderSection,
  StyledForm,
  FormActionsRow,
  GoogleButton,
  FooterSection,
} from './styles';

const { Title, Text } = Typography;

export const LoginPage = () => {
  const [loginForm] = Form.useForm();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const result = await login({ email: values.email, password: values.password }).unwrap();
      if (result.success) {
        message.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      message.error(getErrorMessage(err) || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    globalThis.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <Layout>
      <Container>
        <StyledCard>
          <FullWidthSpace direction="vertical" size="large">
            <HeaderSection>
              <Title level={2}>Welcome Back</Title>
              <Text type="secondary">Sign in to your Art Fare account</Text>
            </HeaderSection>

            <GoogleButton icon={<GoogleOutlined />} size="large" onClick={handleGoogleLogin}>
              Continue with Google
            </GoogleButton>

            <Divider>Or sign in with email</Divider>

            <StyledForm
              form={loginForm}
              name="login"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input name="email" prefix={<MailOutlined />} placeholder="Email" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  name="password"
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <FormActionsRow>
                  <Link to="/forgot-password">
                    <Text type="secondary">Forgot password?</Text>
                  </Link>
                </FormActionsRow>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                  Sign In
                </Button>
              </Form.Item>

              <FooterSection>
                <Text type="secondary">
                  Don't have an account? <Link to="/register">Sign up</Link>
                </Text>
              </FooterSection>
            </StyledForm>
          </FullWidthSpace>
        </StyledCard>
      </Container>
    </Layout>
  );
};
