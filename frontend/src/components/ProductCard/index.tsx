import { FC } from 'react';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
  CardActionArea,
} from '@mui/material';
import { Link } from 'react-router';

interface ProductCardProps {
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  organizationName?: string;
  stockQuantity?: number;
  onAddToCart?: () => void;
  showAddToCart?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({
  slug,
  name,
  price,
  imageUrl,
  organizationName,
  stockQuantity = 0,
  onAddToCart,
  showAddToCart = true,
}) => {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} to={`/products/${slug}`}>
        {imageUrl ? (
          <CardMedia
            component="img"
            height="250"
            image={imageUrl}
            alt={name}
            sx={{ height: 250, objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No Image
            </Typography>
          </Box>
        )}
        <CardContent>
          <Stack spacing={1}>
            {organizationName && (
              <Typography variant="caption" color="text.secondary">
                by {organizationName}
              </Typography>
            )}
            <Typography
              variant="h6"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {name}
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              ${price.toFixed(2)}
            </Typography>
            {stockQuantity > 0 ? (
              <Chip label="In Stock" color="success" size="small" sx={{ alignSelf: 'flex-start' }} />
            ) : (
              <Chip label="Out of Stock" color="error" size="small" sx={{ alignSelf: 'flex-start' }} />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>

      {showAddToCart && (
        <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
            disabled={stockQuantity === 0}
            fullWidth
          >
            Add to Cart
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default ProductCard;
