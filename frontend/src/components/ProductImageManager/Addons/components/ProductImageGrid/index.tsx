import { useState, FC } from 'react';

import { DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import {
  Button,
  Space,
  Input,
  message,
  Modal,
  Typography,
  Row,
  Col,
  Card,
  Badge,
  Image,
} from 'antd';

import { useUpdateProductImageMutation, useDeleteProductImageMutation } from '@/services/apiSlice';
import { ProductImage } from '@/types/common';
import { getErrorMessage } from '@/types/errors';

const { Text } = Typography;

interface ProductImageGridProps {
  productId: number;
  images: ProductImage[];
  onUpdate: () => void;
}

export const ProductImageGrid: FC<ProductImageGridProps> = ({ productId, images, onUpdate }) => {
  const [editingAltId, setEditingAltId] = useState<number | null>(null);
  const [editingAltText, setEditingAltText] = useState('');

  const [updateImage, { isLoading: updating }] = useUpdateProductImageMutation();
  const [deleteImage] = useDeleteProductImageMutation();

  const handleSetThumbnail = async (imageId: number, currentStatus: boolean) => {
    try {
      await updateImage({
        productId,
        imageId,
        data: { is_thumbnail: !currentStatus },
      }).unwrap();
      const successMessage = currentStatus ? 'Thumbnail removed' : 'Thumbnail set!';
      message.success(successMessage);
      onUpdate();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update thumbnail');
    }
  };

  const executeImageDeletion = async (imageId: number) => {
    try {
      await deleteImage({ productId, imageId }).unwrap();
      message.success('Image deleted successfully!');
      onUpdate();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to delete image');
    }
  };

  const handleDeleteImage = (imageId: number) => {
    Modal.confirm({
      title: 'Delete Image',
      content: 'Are you sure you want to delete this image?',
      onOk: () => executeImageDeletion(imageId),
    });
  };

  const handleUpdateAltText = async (imageId: number) => {
    try {
      await updateImage({
        productId,
        imageId,
        data: { alt_text: editingAltText },
      }).unwrap();
      message.success('Alt text updated!');
      setEditingAltId(null);
      setEditingAltText('');
      onUpdate();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update alt text');
    }
  };

  if (images.length === 0) {
    return <Text type="secondary">No images yet. Add your first image above.</Text>;
  }

  return (
    <Row gutter={[16, 16]}>
      {images.map((img) => (
        <Col key={img.id} xs={24} sm={24} md={12} lg={12}>
          <Badge.Ribbon
            text="Thumbnail"
            color="blue"
            style={{ display: img.is_thumbnail ? 'block' : 'none' }}
          >
            <Card
              hoverable
              cover={
                <div style={{ height: 200, overflow: 'hidden', background: '#fafafa' }}>
                  <Image
                    src={img.url}
                    alt={img.alt_text || 'Product image'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    preview
                  />
                </div>
              }
              styles={{ body: { padding: 12 } }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {editingAltId === img.id ? (
                  <>
                    <Input
                      placeholder="Enter alt text"
                      value={editingAltText}
                      onChange={(e) => setEditingAltText(e.target.value)}
                      onPressEnter={() => handleUpdateAltText(img.id)}
                      autoFocus
                    />
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleUpdateAltText(img.id)}
                        loading={updating}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingAltId(null);
                          setEditingAltText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </>
                ) : (
                  <>
                    <Text
                      type={img.alt_text ? undefined : 'secondary'}
                      italic={!img.alt_text}
                      style={{ minHeight: 40, display: 'block' }}
                    >
                      {img.alt_text || 'No alt text'}
                    </Text>
                    <Button
                      size="small"
                      block
                      onClick={() => {
                        setEditingAltId(img.id);
                        setEditingAltText(img.alt_text || '');
                      }}
                    >
                      Edit Alt Text
                    </Button>
                  </>
                )}
                <Space style={{ width: '100%' }}>
                  <Button
                    icon={img.is_thumbnail ? <StarFilled /> : <StarOutlined />}
                    onClick={() => handleSetThumbnail(img.id, img.is_thumbnail || false)}
                    loading={updating && editingAltId !== img.id}
                    type={img.is_thumbnail ? 'primary' : 'default'}
                    size="small"
                    style={{ flex: 1 }}
                  >
                    {img.is_thumbnail ? 'Thumbnail' : 'Set as Thumbnail'}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteImage(img.id)}
                    size="small"
                  >
                    Delete
                  </Button>
                </Space>
              </Space>
            </Card>
          </Badge.Ribbon>
        </Col>
      ))}
    </Row>
  );
};
