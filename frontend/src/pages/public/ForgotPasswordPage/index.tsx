import { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { Layout } from '@/components/Layout';
import { useForgotPasswordMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { CenteredContainer, FormCard, CenteredContent, FullWidthSpace } from './styles';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (values: { email: string }) => {
    try {
      const result = await forgotPassword({ email: values.email }).unwrap();
      setSubmitted(true);
      message.success(result.data?.message || 'Password reset instructions sent to your email');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <Layout>
      <CenteredContainer>
        <FormCard>
          <FullWidthSpace direction="vertical" size={24}>
            <CenteredContent>
              <Title level={2}>Forgot Password</Title>
              {submitted ? (
                <Text type="success">Check your email for password reset instructions.</Text>
              ) : (
                <Text type="secondary">
                  Enter your email address and we'll send you instructions to reset your password.
                </Text>
              )}
            </CenteredContent>

            {submitted ? (
              <CenteredContent>
                <Button type="primary" onClick={() => navigate('/login')} size="large">
                  Back to Login
                </Button>
              </CenteredContent>
            ) : (
              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="your.email@example.com"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
                    Send Reset Instructions
                  </Button>
                </Form.Item>

                <CenteredContent>
                  <Text>
                    Remember your password? <Link to="/login">Back to Login</Link>
                  </Text>
                </CenteredContent>
              </Form>
            )}
          </FullWidthSpace>
        </FormCard>
      </CenteredContainer>
    </Layout>
  );
};

export default ForgotPasswordPage;
