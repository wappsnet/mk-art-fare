-- Migration: Create subscription system tables
-- Description: Implement subscription plans and user subscriptions for Basic and Pro tiers
-- Date: 2025-12-20

-- Table 1: subscription_plans
-- Stores available subscription plans (Basic and Pro)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price DOUBLE NOT NULL DEFAULT 0,
    billing_period ENUM('monthly', 'yearly', 'lifetime') DEFAULT 'monthly',
    max_organizations INT DEFAULT 1 COMMENT 'Max shops allowed (-1 for unlimited)',
    max_products INT DEFAULT 10 COMMENT 'Max products allowed (-1 for unlimited)',
    features JSON COMMENT 'Array of feature descriptions',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: user_subscriptions
-- Tracks each user's current subscription
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL COMMENT 'NULL for lifetime/free plans',
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    INDEX idx_user_id (user_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: subscription_history
-- Audit trail for subscription changes
CREATE TABLE IF NOT EXISTS subscription_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    from_plan_id INT,
    to_plan_id INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason ENUM('upgrade', 'downgrade', 'initial', 'renewal', 'cancellation') NOT NULL,
    notes TEXT COMMENT 'Additional context for the change',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_plan_id) REFERENCES subscription_plans(id),
    FOREIGN KEY (to_plan_id) REFERENCES subscription_plans(id),
    INDEX idx_user_id (user_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial subscription plans
INSERT INTO subscription_plans (name, slug, description, price, billing_period, max_organizations, max_products, features) VALUES
('Basic', 'basic', 'Perfect for getting started', 0, 'lifetime', 1, 10,
 JSON_ARRAY('1 shop', 'Up to 10 products', 'Basic product management', 'Image uploads', 'Order management', 'Customer support')),
('Pro', 'pro', 'For serious artists and businesses', 29, 'monthly', -1, -1,
 JSON_ARRAY('Unlimited shops', 'Unlimited products', 'Advanced product management', 'Custom fields', 'Priority support', 'Analytics dashboard', 'Category management', 'Bulk operations'))
ON DUPLICATE KEY UPDATE name=name;
