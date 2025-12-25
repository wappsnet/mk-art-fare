import { useEffect, useState, FC } from 'react';

import { Space, Typography } from 'antd';

import { ProductImage } from '@/types/common';

import { AddImageForm } from './Addons/components/AddImageForm';
import { ProductImageGrid } from './Addons/components/ProductImageGrid';

const { Title } = Typography;

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
  const [localImages, setLocalImages] = useState<ProductImage[]>(images || []);

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleImageAdded = (newImage: ProductImage | ProductImage[]) => {
    setLocalImages((prev) => {
      const next = [...prev];
      const imagesToAdd = Array.isArray(newImage) ? newImage : [newImage];

      const hasThumbnail = imagesToAdd.some((img) => img.is_thumbnail);
      if (hasThumbnail) {
        next.forEach((img) => {
          img.is_thumbnail = false;
        });
      }

      next.push(...imagesToAdd);
      return next;
    });
  };

  return (
    <Space direction="vertical" size="large">
      <Space direction="vertical">
        <Title level={4}>Add New Image</Title>
        <AddImageForm productId={productId} onImageAdded={handleImageAdded} onUpdate={onUpdate} />
      </Space>

      <Space direction="vertical">
        <Title level={4}>Current Images ({localImages.length})</Title>
        <ProductImageGrid productId={productId} images={localImages} onUpdate={onUpdate} />
      </Space>
    </Space>
  );
};
