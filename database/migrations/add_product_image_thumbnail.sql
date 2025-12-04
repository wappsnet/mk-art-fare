-- Add is_thumbnail column to product_images table

ALTER TABLE product_images
ADD COLUMN is_thumbnail BOOLEAN DEFAULT FALSE AFTER sort_order;

-- Create index for is_thumbnail
CREATE INDEX idx_is_thumbnail ON product_images(is_thumbnail);
