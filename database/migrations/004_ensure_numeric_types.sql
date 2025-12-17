-- Migration to ensure all price and numeric fields use proper numeric types
-- This will convert any existing string values to numbers automatically

-- Products table - ensure price fields are DOUBLE
ALTER TABLE products
  MODIFY COLUMN price DOUBLE NOT NULL,
  MODIFY COLUMN compare_at_price DOUBLE;

-- Orders table - ensure all monetary and quantity fields are numeric
ALTER TABLE orders
  MODIFY COLUMN subtotal DOUBLE NOT NULL,
  MODIFY COLUMN tax DOUBLE DEFAULT 0,
  MODIFY COLUMN shipping_cost DOUBLE DEFAULT 0,
  MODIFY COLUMN total DOUBLE NOT NULL;

-- Order items table - ensure price and quantity fields are numeric
ALTER TABLE order_items
  MODIFY COLUMN quantity INT NOT NULL,
  MODIFY COLUMN price DOUBLE NOT NULL,
  MODIFY COLUMN subtotal DOUBLE NOT NULL;

-- Products table - ensure stock quantity is INT
ALTER TABLE products
  MODIFY COLUMN stock_quantity INT DEFAULT 0;

-- Cart items table - ensure quantity is INT
ALTER TABLE cart_items
  MODIFY COLUMN quantity INT NOT NULL DEFAULT 1;

-- Blog posts table - ensure view count is INT
ALTER TABLE blog_posts
  MODIFY COLUMN view_count INT DEFAULT 0;
