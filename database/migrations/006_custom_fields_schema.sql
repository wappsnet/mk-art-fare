-- Migration: Create custom fields system tables
-- Description: Implement ACF-like custom fields for products with field groups, definitions, and values

-- Table 1: field_groups - Reusable field templates/groups
CREATE TABLE IF NOT EXISTS field_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_org_slug (organization_id, slug),
    INDEX idx_organization_id (organization_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: field_definitions - Individual field configurations within groups
CREATE TABLE IF NOT EXISTS field_definitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    field_group_id INT NOT NULL,
    name VARCHAR(255) NOT NULL COMMENT 'Machine name for the field',
    label VARCHAR(255) NOT NULL COMMENT 'Human-readable label',
    field_type ENUM('text', 'number', 'select', 'checkbox', 'radio', 'toggle', 'date', 'time', 'color', 'image', 'file', 'richtext') NOT NULL,
    placeholder VARCHAR(255) COMMENT 'Placeholder text for input fields',
    help_text TEXT COMMENT 'Help text displayed below the field',
    default_value TEXT COMMENT 'Default value for the field',
    options JSON COMMENT 'Options for select/radio/checkbox: [{"label": "Option 1", "value": "opt1"}]',
    validation_rules JSON COMMENT 'Validation rules: {"required": true, "min": 0, "max": 100, "pattern": "regex"}',
    conditional_logic JSON COMMENT 'Conditional logic for show/hide: {"enabled": true, "logic_type": "AND", "rule_groups": [...]}',
    is_searchable BOOLEAN DEFAULT FALSE COMMENT 'Whether to index for search',
    is_filterable BOOLEAN DEFAULT FALSE COMMENT 'Whether to show in product filters',
    sort_order INT DEFAULT 0 COMMENT 'Display order within the field group',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (field_group_id) REFERENCES field_groups(id) ON DELETE CASCADE,
    INDEX idx_field_group_id (field_group_id),
    INDEX idx_field_type (field_type),
    INDEX idx_sort_order (sort_order),
    INDEX idx_searchable (is_searchable),
    INDEX idx_filterable (is_filterable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: product_field_group_assignments - Link products to field groups (many-to-many)
CREATE TABLE IF NOT EXISTS product_field_group_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    field_group_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (field_group_id) REFERENCES field_groups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_group (product_id, field_group_id),
    INDEX idx_product_id (product_id),
    INDEX idx_field_group_id (field_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: product_field_values - Store actual field values (EAV pattern optimized)
-- Uses typed columns for efficient filtering/indexing + JSON for complex types
CREATE TABLE IF NOT EXISTS product_field_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    field_definition_id INT NOT NULL,

    -- Type-specific columns for efficient querying and indexing
    value_text VARCHAR(1000) COMMENT 'For text, select, radio, color fields',
    value_number DOUBLE COMMENT 'For number fields',
    value_boolean BOOLEAN COMMENT 'For toggle, single checkbox fields',
    value_date DATE COMMENT 'For date fields',
    value_time TIME COMMENT 'For time fields',
    value_json JSON COMMENT 'For complex types: multi-checkbox, file/image metadata',
    value_longtext LONGTEXT COMMENT 'For richtext content',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (field_definition_id) REFERENCES field_definitions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_field (product_id, field_definition_id),

    -- Base indexes
    INDEX idx_product_id (product_id),
    INDEX idx_field_definition_id (field_definition_id),

    -- Indexes for searchable/filterable fields (performance optimization)
    INDEX idx_value_text (value_text(255)),
    INDEX idx_value_number (value_number),
    INDEX idx_value_boolean (value_boolean),
    INDEX idx_value_date (value_date),

    -- Full-text indexes for search functionality
    FULLTEXT INDEX ft_value_text (value_text),
    FULLTEXT INDEX ft_value_longtext (value_longtext),

    -- Composite indexes for common query patterns
    INDEX idx_product_field_text (product_id, field_definition_id, value_text(100)),
    INDEX idx_product_field_number (product_id, field_definition_id, value_number),
    INDEX idx_product_field_date (product_id, field_definition_id, value_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
