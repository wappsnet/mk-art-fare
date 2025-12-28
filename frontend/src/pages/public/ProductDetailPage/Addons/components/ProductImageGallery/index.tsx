import { FC } from 'react';

import ImageIcon from '@mui/icons-material/Image';
import { Box, Stack } from '@mui/material';

interface ProductImageGalleryProps {
  images: Array<{ id: number; url: string; alt_text?: string }>;
  selectedIndex: number;
  onSelectImage: (index: number) => void;
  productName: string;
}

const ProductImageGallery: FC<ProductImageGalleryProps> = ({
  images,
  selectedIndex,
  onSelectImage,
  productName,
}) => {
  if (images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 500,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
        }}
      >
        <ImageIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
      </Box>
    );
  }

  const currentImage = images[selectedIndex];
  const hasMultiple = images.length > 1;

  return (
    <Stack spacing={2}>
      {/* Main Image */}
      <Box
        sx={{
          width: '100%',
          height: 500,
          bgcolor: 'grey.100',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="img"
          src={currentImage?.url}
          alt={currentImage?.alt_text || productName}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Thumbnails */}
      {hasMultiple && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {images.map((img, index) => (
            <Box
              key={img.id}
              onClick={() => onSelectImage(index)}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: 2,
                borderColor: index === selectedIndex ? 'primary.main' : 'transparent',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                component="img"
                src={img.url}
                alt={img.alt_text || `${productName} ${index + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default ProductImageGallery;
