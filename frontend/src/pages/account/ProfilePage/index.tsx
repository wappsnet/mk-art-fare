import { useState } from 'react';

import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { Form, Input, Button, message, Avatar, Upload } from 'antd';

import { useAppSelector } from '@/hooks/useRedux';
import { useUpdateProfileMutation, useUploadAvatarMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';

import {
  ProfileContainerStyled,
  AvatarSectionStyled,
  UploadButtonStyled,
  FullWidthSpaceStyled,
} from './styles';

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
}

const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm<ProfileFormValues>();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url);

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile(values).unwrap();
      message.success('Profile updated successfully');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await uploadAvatar(formData).unwrap();
      setAvatarUrl(response.data?.avatar_url);
      message.success('Avatar uploaded successfully');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to upload avatar');
    }
    return false; // Prevent default upload behavior
  };

  return (
    <ProfileContainerStyled>
      <AvatarSectionStyled>
        <Avatar size={100} src={avatarUrl} icon={<UserOutlined />} />
        <Upload accept="image/*" showUploadList={false} beforeUpload={handleAvatarUpload}>
          <UploadButtonStyled icon={<UploadOutlined />} loading={isUploading}>
            Change Avatar
          </UploadButtonStyled>
        </Upload>
      </AvatarSectionStyled>

      <Form<ProfileFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
        }}
        onFinish={handleSubmit}
      >
        <FullWidthSpaceStyled direction="vertical" size="large">
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
        </FullWidthSpaceStyled>
      </Form>
    </ProfileContainerStyled>
  );
};

export default ProfilePage;
