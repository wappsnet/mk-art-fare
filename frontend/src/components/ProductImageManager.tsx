import { useEffect, useState } from 'react';
import { Upload, Button, List, Image, Space, Input, Switch, message, Modal, Tabs } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  LinkOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import styled from '@emotion/styled';
import { ProductImage } from '@/types';
import {
  useAddProductImageMutation,
  useUpdateProductImageMutation,
  useDeleteProductImageMutation,
} from '@/services/apiSlice';
import axios from 'axios';

const ImageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const ThumbnailBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #1890ff;
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 10px;
`;

interface ProductImageManagerProps {
  productId: number;
  images: ProductImage[];
  onUpdate: () => void;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  productId,
  images,
  onUpdate,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isThumbnail, setIsThumbnail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [altTexts, setAltTexts] = useState<Record<string, string>>({});
  const [localImages, setLocalImages] = useState<ProductImage[]>(images);

  const [addImage, { isLoading: adding }] = useAddProductImageMutation();
  const [updateImage, { isLoading: updating }] = useUpdateProductImageMutation();
  const [deleteImage] = useDeleteProductImageMutation();

  // keep local images in sync when prop changes
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

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
      const created = (resp as any)?.data as ProductImage | undefined;
      if (created) {
        setLocalImages((prev) => {
          const next = [...prev];
          if (created.is_thumbnail) {
            for (const img of next) {
              (img as any).is_thumbnail = false;
            }
          }
          next.push(created);
          return next;
        });
      }
      setImageUrl('');
      setAltText('');
      setIsThumbnail(false);
      onUpdate();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to add image');
    }
  };

  const handleSetThumbnail = async (imageId: number, currentStatus: boolean) => {
    try {
      await updateImage({
        productId,
        imageId,
        data: { is_thumbnail: !currentStatus },
      }).unwrap();
      message.success(currentStatus ? 'Thumbnail removed' : 'Thumbnail set!');
      onUpdate();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update thumbnail');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    Modal.confirm({
      title: 'Delete Image',
      content: 'Are you sure you want to delete this image?',
      onOk: async () => {
        try {
          await deleteImage({ productId, imageId }).unwrap();
          message.success('Image deleted successfully!');
          // Optimistically update UI
          setLocalImages((prev) => prev.filter((img) => img.id !== imageId));
          onUpdate();
        } catch (error: any) {
          message.error(error?.data?.message || 'Failed to delete image');
        }
      },
    });
  };

  const handleUploadSelected = async () => {
    if (!fileList.length) {
      message.error('Please select image file(s)');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    // Append as multiple under 'images' field to leverage backend multi-upload
    fileList.forEach((f) => {
      const origin = f.originFileObj as RcFile;
      if (origin) {
        formData.append('images', origin);
        // Append matching alt text per file (backend supports multiple alt_text fields)
        formData.append('alt_text', altTexts[f.uid] || '');
      }
    });
    formData.append('is_thumbnail', isThumbnail.toString());

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const resp = await axios.post(`${apiUrl}/products/${productId}/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Image(s) uploaded successfully!');
      const payload = (resp as any)?.data;
      const created = payload?.data as ProductImage | ProductImage[] | undefined;
      if (created) {
        setLocalImages((prev) => {
          const next = [...prev];
          const addOne = (img: ProductImage) => {
            if (img.is_thumbnail) {
              for (const existing of next) {
                (existing as any).is_thumbnail = false;
              }
            }
            next.push(img);
          };
          if (Array.isArray(created)) {
            for (const img of created) addOne(img);
          } else {
            addOne(created);
          }
          return next;
        });
      }
      setFileList([]);
      setAltTexts({});
      setAltText('');
      setIsThumbnail(false);
      onUpdate();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to upload image(s)');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <h4>Add New Image</h4>
          <Tabs
            items={[
              {
                key: 'upload',
                label: (
                  <span>
                    <PictureOutlined /> Upload File
                  </span>
                ),
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
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
                      beforeUpload={() => false} // prevent auto upload; we'll submit manually
                    >
                      <Button icon={<UploadOutlined />}>Select Image File</Button>
                    </Upload>
                    {fileList.length > 0 && (
                      <div>
                        {fileList.map((f) => (
                          <div
                            key={f.uid}
                            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                          >
                            <span style={{ minWidth: 120, fontSize: 12, color: '#666' }}>
                              {f.name}
                            </span>
                            <Input
                              placeholder="Alt text for this image (optional)"
                              value={altTexts[f.uid] || ''}
                              onChange={(e) =>
                                setAltTexts((prev) => ({ ...prev, [f.uid]: e.target.value }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <Space>
                      <Switch checked={isThumbnail} onChange={setIsThumbnail} />
                      <span>Set as thumbnail</span>
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
                  <span>
                    <LinkOutlined /> Image URL
                  </span>
                ),
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
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
                      <span>Set as thumbnail</span>
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
        </div>

        {localImages.length > 0 && (
          <div>
            <h4>Current Images ({localImages.length})</h4>
            <List
              dataSource={localImages}
              renderItem={(img) => (
                <ImageItem>
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={img.url}
                      alt={img.alt_text}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                    {img.is_thumbnail && <ThumbnailBadge>Thumbnail</ThumbnailBadge>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div>{img.alt_text || 'No alt text'}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{img.url.substring(0, 50)}...</div>
                  </div>
                  <Space>
                    <Button
                      icon={img.is_thumbnail ? <StarFilled /> : <StarOutlined />}
                      onClick={() => handleSetThumbnail(img.id, img.is_thumbnail || false)}
                      loading={updating}
                      type={img.is_thumbnail ? 'primary' : 'default'}
                      size="small"
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
                </ImageItem>
              )}
            />
          </div>
        )}
      </Space>
    </div>
  );
};
