import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createCustomFieldsTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'art_fare',
  });

  try {
    console.log('Creating custom fields tables...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS field_groups (
        id INT PRIMARY KEY AUTO_INCREMENT,
        organization_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_org_slug (organization_id, slug),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        INDEX idx_organization (organization_id),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created field_groups table');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS field_definitions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        field_group_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        label VARCHAR(255) NOT NULL,
        type ENUM('text', 'number', 'select', 'radio', 'checkbox', 'toggle', 'date', 'time', 'color', 'image', 'file', 'richtext') NOT NULL,
        placeholder VARCHAR(255),
        help_text TEXT,
        default_value TEXT,
        options JSON,
        validation_rules JSON,
        required BOOLEAN DEFAULT FALSE,
        is_searchable BOOLEAN DEFAULT FALSE,
        is_filterable BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (field_group_id) REFERENCES field_groups(id) ON DELETE CASCADE,
        INDEX idx_field_group (field_group_id),
        INDEX idx_type (type),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created field_definitions table');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_field_groups (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        field_group_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_product_group (product_id, field_group_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (field_group_id) REFERENCES field_groups(id) ON DELETE CASCADE,
        INDEX idx_product (product_id),
        INDEX idx_field_group (field_group_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created product_field_groups table');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_field_values (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        field_definition_id INT NOT NULL,
        value JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_product_field (product_id, field_definition_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (field_definition_id) REFERENCES field_definitions(id) ON DELETE CASCADE,
        INDEX idx_product (product_id),
        INDEX idx_field_definition (field_definition_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created product_field_values table');

    console.log('\n✅ All custom fields tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    connection.end();
  }
}

createCustomFieldsTables();
