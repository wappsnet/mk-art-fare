import { useEffect } from 'react';
import { Input, Button, Typography, Divider, Form, message } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { useAppSelector } from '@/hooks/useRedux';
import { useLoginMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors.ts';
import {
  FullWidthSpaceStyled,
  HeaderSectionStyled,
  FormActionsRowStyled,
  GoogleButtonStyled,
  FooterSectionStyled,
} from './styles';
import AppAuthLayout from '@/components/AppAuthLayout';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [loginForm] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: LoginFormValues) => {
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
    <AppAuthLayout>
      <FullWidthSpaceStyled direction="vertical" size="large">
        <HeaderSectionStyled>
          <Title level={2}>Welcome Back</Title>
          <Text type="secondary">Sign in to your Art Fare account</Text>
        </HeaderSectionStyled>

        <GoogleButtonStyled icon={<GoogleOutlined />} size="large" onClick={handleGoogleLogin}>
          Continue with Google
        </GoogleButtonStyled>

        <Divider>Or sign in with email</Divider>

        <Form<LoginFormValues>
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
            <FormActionsRowStyled>
              <Link to="/forgot-password">
                <Text type="secondary">Forgot password?</Text>
              </Link>
            </FormActionsRowStyled>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
              Sign In
            </Button>
          </Form.Item>

          <FooterSectionStyled>
            <Text type="secondary">
              Don't have an account? <Link to="/register">Sign up</Link>
            </Text>
          </FooterSectionStyled>
        </Form>
      </FullWidthSpaceStyled>
    </AppAuthLayout>
  );
};

export default LoginPage;
