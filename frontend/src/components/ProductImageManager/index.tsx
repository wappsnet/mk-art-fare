import { useEffect, useState, FC } from 'react';
import { Upload, Button, Space, Input, Switch, message, Modal, Tabs } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  LinkOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { ProductImage } from '@/types/common';
import {
  useAddProductImageMutation,
  useUpdateProductImageMutation,
  useDeleteProductImageMutation,
} from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import axios from 'axios';
import {
  ImageCardFooterStyled,
  ImageCardStyled,
  ImageCardActionsStyled,
  ImageCardContentStyled,
  ThumbnailBadgeStyled,
  FullWidthSpace,
  FullWidthVerticalSpace,
  ImageGridContainer,
  AltTextDisplay,
} from './style.ts';

interface ProductImageManagerProps {
  productId: number;
  images: ProductImage[];
  onUpdate: () => void;
}

export const ProductImageManager: FC<ProductImageManagerProps> = ({
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
  const [localImages, setLocalImages] = useState<ProductImage[]>(images || []);
  const [editingAltId, setEditingAltId] = useState<number | null>(null);
  const [editingAltText, setEditingAltText] = useState('');

  const [addImage, { isLoading: adding }] = useAddProductImageMutation();
  const [updateImage, { isLoading: updating }] = useUpdateProductImageMutation();
  const [deleteImage] = useDeleteProductImageMutation();

  // keep local images in sync when prop changes
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleAddImage = async () => {
    if (imageUrl) {
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

        const created = resp.data;
        if (created) {
          setLocalImages((prev) => {
            const next = [...prev];
            if (created.is_thumbnail) {
              for (const existingImg of next) {
                existingImg.is_thumbnail = false;
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
      } catch (error) {
        message.error(getErrorMessage(error) || 'Failed to add image');
      }
      return;
    }
    message.error('Please enter an image URL');
  };

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
        } catch (error) {
          message.error(getErrorMessage(error) || 'Failed to delete image');
        }
      },
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
      setLocalImages((prev) =>
        prev.map((img) => {
          if (img.id === imageId) {
            return { ...img, alt_text: editingAltText };
          }
          return img;
        })
      );
      setEditingAltId(null);
      setEditingAltText('');
      onUpdate();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to update alt text');
    }
  };

  const handleUploadSelected = async () => {
    if (fileList.length > 0) {
      setUploading(true);
      const formData = new FormData();
      // Append as multiple under 'images' field to leverage backend multi-upload
      fileList.forEach((f) => {
        const origin = f.originFileObj;
        if (origin && origin instanceof File) {
          formData.append('images', origin);
          // Append matching alt text per file (backend supports multiple alt_text fields)
          formData.append('alt_text', altTexts[f.uid] || '');
        }
      });
      formData.append('is_thumbnail', isThumbnail.toString());

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

        const created = resp.data?.data as ProductImage | ProductImage[] | undefined;
        if (created) {
          setLocalImages((prev) => {
            const next = [...prev];
            const addOne = (img: ProductImage) => {
              if (img.is_thumbnail) {
                for (const existing of next) {
                  existing.is_thumbnail = false;
                }
              }
              next.push(img);
            };

            if (Array.isArray(created)) {
              created.forEach(addOne);
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
      } catch (error) {
        message.error(getErrorMessage(error) || 'Failed to upload image(s)');
      } finally {
        setUploading(false);
      }
      return;
    }
    message.error('Please select image file(s)');
  };

  return (
    <div>
      <FullWidthSpace direction="vertical" size="large">
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
                  <FullWidthVerticalSpace direction="vertical">
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
                  </FullWidthVerticalSpace>
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
                  <FullWidthVerticalSpace direction="vertical">
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
                  </FullWidthVerticalSpace>
                ),
              },
            ]}
          />
        </div>

        <div>
          <h4>Current Images ({localImages.length})</h4>
          <ImageGridContainer>
              {localImages.map((img) => (
                <ImageCardStyled key={img.id}>
                  <ImageCardContentStyled>
                    <img src={img.url} alt={img.alt_text || 'Product image'} />
                    {!!img.is_thumbnail && <ThumbnailBadgeStyled>Thumbnail</ThumbnailBadgeStyled>}
                  </ImageCardContentStyled>
                  <ImageCardFooterStyled>
                    {editingAltId === img.id ? (
                      <div>
                        <Input
                          placeholder="Enter alt text"
                          value={editingAltText}
                          onChange={(e) => setEditingAltText(e.target.value)}
                          onPressEnter={() => handleUpdateAltText(img.id)}
                          autoFocus
                          css={{ marginBottom: 8 }}
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
                      </div>
                    ) : (
                      <>
                        <AltTextDisplay hasAltText={!!img.alt_text}>
                          {img.alt_text || 'No alt text'}
                        </AltTextDisplay>
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
                    <ImageCardActionsStyled>
                      <Button
                        icon={img.is_thumbnail ? <StarFilled /> : <StarOutlined />}
                        onClick={() => handleSetThumbnail(img.id, img.is_thumbnail || false)}
                        loading={updating && editingAltId !== img.id}
                        type={img.is_thumbnail ? 'primary' : 'default'}
                        size="small"
                        css={{ flex: 1 }}
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
                    </ImageCardActionsStyled>
                  </ImageCardFooterStyled>
                </ImageCardStyled>
              ))}
            </ImageGridContainer>
          </div>
      </FullWidthSpace>
    </div>
  );
};
