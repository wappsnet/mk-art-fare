import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function dropCustomFieldsTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'art_fare',
  });

  try {
    console.log('Dropping custom fields tables...');

    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Disabled foreign key checks');

    await connection.execute('DROP TABLE IF EXISTS product_field_values');
    console.log('✓ Dropped product_field_values table');

    await connection.execute('DROP TABLE IF EXISTS field_values');
    console.log('✓ Dropped field_values table');

    await connection.execute('DROP TABLE IF EXISTS product_field_groups');
    console.log('✓ Dropped product_field_groups table');

    await connection.execute('DROP TABLE IF EXISTS field_definitions');
    console.log('✓ Dropped field_definitions table');

    await connection.execute('DROP TABLE IF EXISTS field_groups');
    console.log('✓ Dropped field_groups table');

    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Re-enabled foreign key checks');

    console.log('\n✅ All custom fields tables dropped successfully!');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  } finally {
    connection.end();
  }
}

dropCustomFieldsTables();
