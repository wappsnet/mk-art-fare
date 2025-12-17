import { useState } from 'react';
import { Form, Input, Button, message, Avatar, Upload, Space } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/hooks/useRedux';
import { useUpdateProfileMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { ProfileContainerStyled, AvatarSectionStyled } from './styles';

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
}

export const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [avatarUrl] = useState(user?.avatar_url);

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile(values).unwrap();
      message.success('Profile updated successfully');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (_file: File) => {
    // TODO: Implement avatar upload
    message.info('Avatar upload will be implemented');
    return false;
  };

  return (
    <ProfileContainerStyled>
      <AvatarSectionStyled>
        <Avatar size={100} src={avatarUrl} icon={<UserOutlined />} />
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleAvatarUpload}
        >
          <Button icon={<UploadOutlined />} style={{ marginTop: 16 }}>
            Change Avatar
          </Button>
        </Upload>
      </AvatarSectionStyled>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
        }}
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input placeholder="John" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input placeholder="Doe" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="john.doe@example.com" />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="+1 (555) 123-4567" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Save Changes
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </ProfileContainerStyled>
  );
};
