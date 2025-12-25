import { useState, FC } from 'react';

import { UploadOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import {
  Upload,
  Button,
  Space,
  Input,
  Switch,
  message,
  Tabs,
  Typography,
  type UploadFile,
} from 'antd';
import axios from 'axios';

import { useAddProductImageMutation } from '@/services/apiSlice';
import { ProductImage } from '@/types/common';
import { getErrorMessage } from '@/types/errors';

const { Text } = Typography;

interface AddImageFormProps {
  productId: number;
  onImageAdded: (image: ProductImage | ProductImage[]) => void;
  onUpdate: () => void;
}

export const AddImageForm: FC<AddImageFormProps> = ({ productId, onImageAdded, onUpdate }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isThumbnail, setIsThumbnail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [altTexts, setAltTexts] = useState<Record<string, string>>({});

  const [addImage, { isLoading: adding }] = useAddProductImageMutation();

  const resetImageForm = () => {
    setImageUrl('');
    setAltText('');
    setIsThumbnail(false);
  };

  const resetUploadForm = () => {
    setFileList([]);
    setAltTexts({});
    setAltText('');
    setIsThumbnail(false);
  };

  const handleAddImage = async () => {
    if (!imageUrl) {
      message.error('Please enter an image URL');
      return;
    }

    try {
      const resp = await addImage({
        productId,
        data: {
          url: imageUrl,
          alt_text: altText || undefined,
          is_thumbnail: isThumbnail,
        },
      }).unwrap();

      message.success('Image added successfully!');

      if (resp.data) {
        onImageAdded(resp.data);
      }

      resetImageForm();
      onUpdate();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to add image');
    }
  };

  const prepareUploadFormData = () => {
    const formData = new FormData();
    fileList.forEach((f) => {
      const origin = f.originFileObj;
      if (origin) {
        formData.append('images', origin);
        formData.append('alt_text', altTexts[f.uid] || '');
      }
    });
    formData.append('is_thumbnail', isThumbnail.toString());
    return formData;
  };

  const handleUploadSelected = async () => {
    if (fileList.length === 0) {
      message.error('Please select image file(s)');
      return;
    }

    setUploading(true);
    const formData = prepareUploadFormData();

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL;
      const resp = await axios.post(`${apiUrl}/products/${productId}/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      message.success('Image(s) uploaded successfully!');

      const created = resp.data?.data;
      if (created) {
        onImageAdded(created);
      }

      resetUploadForm();
      onUpdate();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to upload image(s)');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Tabs
      items={[
        {
          key: 'upload',
          label: (
            <Text>
              <PictureOutlined /> Upload File
            </Text>
          ),
          children: (
            <Space direction="vertical">
              <Upload
                multiple
                fileList={fileList}
                onChange={({ fileList }) => {
                  setFileList(fileList);
                  setAltTexts((prev) => {
                    const next: Record<string, string> = {};
                    fileList.forEach((f) => {
                      next[f.uid] = prev[f.uid] || '';
                    });
                    return next;
                  });
                }}
                accept="image/*"
                listType="picture"
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Select Image File</Button>
              </Upload>
              <Space>
                <Switch checked={isThumbnail} onChange={setIsThumbnail} />
                <Text>Set as thumbnail</Text>
              </Space>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUploadSelected}
                loading={uploading}
                disabled={fileList.length === 0}
              >
                Upload Image{fileList.length > 1 ? 's' : ''}
              </Button>
            </Space>
          ),
        },
        {
          key: 'url',
          label: (
            <Text>
              <LinkOutlined /> Image URL
            </Text>
          ),
          children: (
            <Space direction="vertical">
              <Input
                placeholder="Image URL (e.g., https://example.com/image.jpg)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                placeholder="Alt text (optional)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
              <Space>
                <Switch checked={isThumbnail} onChange={setIsThumbnail} />
                <Text>Set as thumbnail</Text>
              </Space>
              <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={handleAddImage}
                loading={adding}
              >
                Add Image
              </Button>
            </Space>
          ),
        },
      ]}
    />
  );
};
