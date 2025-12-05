-- Event Moderation and Enhanced Ticketing Migration

-- Add moderation fields to events table
ALTER TABLE events
ADD COLUMN moderation_status ENUM('pending', 'approved', 'declined', 'removed') DEFAULT 'pending' AFTER is_active,
ADD COLUMN moderation_comment TEXT AFTER moderation_status,
ADD COLUMN moderated_by INT AFTER moderation_comment,
ADD COLUMN moderated_at TIMESTAMP NULL AFTER moderated_by,
ADD COLUMN created_by INT NOT NULL AFTER organization_id,
ADD COLUMN video_url VARCHAR(500) AFTER featured_image_url,
ADD COLUMN video_file VARCHAR(500) AFTER video_url,
ADD FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL,
ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
ADD INDEX idx_moderation_status (moderation_status),
ADD INDEX idx_moderated_by (moderated_by),
ADD INDEX idx_created_by (created_by);

-- Event media table for multiple images and videos
CREATE TABLE event_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    url VARCHAR(500),
    file_path VARCHAR(500),
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_media_type (media_type)
);

-- Update event_tickets to support free and paid tickets with delivery options
ALTER TABLE event_tickets
ADD COLUMN is_free BOOLEAN DEFAULT FALSE AFTER price,
ADD COLUMN delivery_method ENUM('virtual', 'physical_delivery', 'pickup', 'all') DEFAULT 'virtual' AFTER description,
ADD COLUMN pickup_location VARCHAR(500) AFTER delivery_method,
ADD COLUMN pickup_instructions TEXT AFTER pickup_location;

-- Event ticket purchases (cart integration)
CREATE TABLE event_ticket_cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    ticket_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES event_tickets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_ticket (cart_id, ticket_id),
    INDEX idx_cart_id (cart_id),
    INDEX idx_ticket_id (ticket_id)
);

-- Update event_bookings with delivery preferences
ALTER TABLE event_bookings
ADD COLUMN delivery_method ENUM('virtual', 'physical_delivery', 'pickup') DEFAULT 'virtual' AFTER attendee_phone,
ADD COLUMN delivery_address_line1 VARCHAR(255) AFTER delivery_method,
ADD COLUMN delivery_address_line2 VARCHAR(255) AFTER delivery_address_line1,
ADD COLUMN delivery_city VARCHAR(100) AFTER delivery_address_line2,
ADD COLUMN delivery_state VARCHAR(100) AFTER delivery_city,
ADD COLUMN delivery_country VARCHAR(100) AFTER delivery_state,
ADD COLUMN delivery_postal_code VARCHAR(20) AFTER delivery_country,
ADD COLUMN pickup_location VARCHAR(500) AFTER delivery_postal_code,
ADD COLUMN virtual_ticket_code VARCHAR(100) UNIQUE AFTER pickup_location,
ADD COLUMN qr_code_url VARCHAR(500) AFTER virtual_ticket_code,
ADD COLUMN email_sent BOOLEAN DEFAULT FALSE AFTER qr_code_url,
ADD COLUMN email_sent_at TIMESTAMP NULL AFTER email_sent,
ADD INDEX idx_virtual_ticket_code (virtual_ticket_code),
ADD INDEX idx_delivery_method (delivery_method);

-- Order items for event tickets
CREATE TABLE order_event_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    booking_id INT NOT NULL,
    ticket_id INT NOT NULL,
    event_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    event_title VARCHAR(255),
    ticket_type VARCHAR(100),
    delivery_method ENUM('virtual', 'physical_delivery', 'pickup') DEFAULT 'virtual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES event_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES event_tickets(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    INDEX idx_order_id (order_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_event_id (event_id)
);

-- Moderation history log
CREATE TABLE event_moderation_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    moderator_id INT NOT NULL,
    action ENUM('pending', 'approved', 'declined', 'removed') NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_moderator_id (moderator_id),
    INDEX idx_action (action)
);
