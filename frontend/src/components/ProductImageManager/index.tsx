import { useEffect, useState, FC } from 'react';

import { Stack, Typography } from '@mui/material';

import { ProductImage } from '@/types/common';

import { AddImageForm } from './Addons/components/AddImageForm';
import { ProductImageGrid } from './Addons/components/ProductImageGrid';

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
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h6">Add New Image</Typography>
        <AddImageForm productId={productId} onImageAdded={handleImageAdded} onUpdate={onUpdate} />
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h6">Current Images ({localImages.length})</Typography>
        <ProductImageGrid productId={productId} images={localImages} onUpdate={onUpdate} />
      </Stack>
    </Stack>
  );
};
