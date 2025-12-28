import { useState, FC } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  Button,
  Stack,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
} from '@mui/material';

import { useConfirm } from '@/components/ConfirmDialog';
import { useUpdateProductImageMutation, useDeleteProductImageMutation } from '@/services/apiSlice';
import { ProductImage } from '@/types/common';
import { getErrorMessage } from '@/types/errors';
import { message } from '@/utils/notification';

interface ProductImageGridProps {
  productId: number;
  images: ProductImage[];
  onUpdate: () => void;
}

export const ProductImageGrid: FC<ProductImageGridProps> = ({ productId, images, onUpdate }) => {
  const [editingAltId, setEditingAltId] = useState<number | null>(null);
  const [editingAltText, setEditingAltText] = useState('');

  const { confirm } = useConfirm();

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
    confirm({
      title: 'Delete Image',
      content: 'Are you sure you want to delete this image?',
      onConfirm: () => executeImageDeletion(imageId),
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
    return (
      <Typography color="text.secondary">No images yet. Add your first image above.</Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {images.map((img) => (
        <Grid size={{ xs: 12, sm: 12, md: 6 }} key={img.id}>
          <Card sx={{ position: 'relative' }}>
            {!!img.is_thumbnail && (
              <Chip
                label="Thumbnail"
                color="primary"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                }}
              />
            )}
            <CardMedia
              component="img"
              height="200"
              image={img.url}
              alt={img.alt_text || 'Product image'}
              sx={{
                objectFit: 'cover',
                bgcolor: 'grey.100',
                height: '200px',
              }}
            />
            <CardContent>
              <Stack spacing={2}>
                {editingAltId === img.id ? (
                  <>
                    <TextField
                      label="Alt Text"
                      placeholder="Enter alt text"
                      value={editingAltText}
                      onChange={(e) => setEditingAltText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateAltText(img.id);
                        }
                      }}
                      autoFocus
                      fullWidth
                      size="small"
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleUpdateAltText(img.id)}
                        disabled={updating}
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
                    </Stack>
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    color={img.alt_text ? 'text.primary' : 'text.secondary'}
                    fontStyle={img.alt_text ? 'normal' : 'italic'}
                    sx={{ minHeight: 40 }}
                  >
                    {img.alt_text || 'No alt text'}
                  </Typography>
                )}
              </Stack>
            </CardContent>
            <CardActions>
              <Stack direction="column" spacing={1} flex={1}>
                <Button
                  size="medium"
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setEditingAltId(img.id);
                    setEditingAltText(img.alt_text || '');
                  }}
                >
                  Edit Alt Text
                </Button>
                <Button
                  startIcon={img.is_thumbnail ? <StarIcon /> : <StarBorderIcon />}
                  onClick={() => handleSetThumbnail(img.id, img.is_thumbnail || false)}
                  disabled={updating && editingAltId !== img.id}
                  variant={img.is_thumbnail ? 'contained' : 'outlined'}
                  size="medium"
                  sx={{ flex: 1 }}
                >
                  {img.is_thumbnail ? 'Thumbnail' : 'Set as Thumbnail'}
                </Button>
                <Button
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteImage(img.id)}
                  size="medium"
                >
                  Delete
                </Button>
              </Stack>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
