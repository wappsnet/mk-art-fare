-- Change price columns from DECIMAL to DOUBLE for numeric storage

-- Products table
ALTER TABLE products
  MODIFY COLUMN price DOUBLE NOT NULL,
  MODIFY COLUMN compare_at_price DOUBLE;

-- Order items table
ALTER TABLE order_items
  MODIFY COLUMN price DOUBLE NOT NULL,
  MODIFY COLUMN subtotal DOUBLE NOT NULL;

-- Orders table
ALTER TABLE orders
  MODIFY COLUMN subtotal DOUBLE NOT NULL,
  MODIFY COLUMN tax DOUBLE DEFAULT 0,
  MODIFY COLUMN shipping_cost DOUBLE DEFAULT 0,
  MODIFY COLUMN total DOUBLE NOT NULL;

-- Event tickets table
ALTER TABLE event_tickets
  MODIFY COLUMN price DOUBLE NOT NULL;

-- Event bookings table
ALTER TABLE event_bookings
  MODIFY COLUMN total_price DOUBLE NOT NULL;
