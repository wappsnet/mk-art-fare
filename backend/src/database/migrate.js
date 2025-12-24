import fs from 'node:fs';
import path from 'node:path';
import pool from '../config/database.js';

const runMigrations = async () => {
  try {
    console.info('🔄 Starting database migration...');

    const schemaPath = path.join(__dirname, '../../..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    const connection = pool.getConnection();

    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.info('✅ Executed statement');
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.info('⚠️  Table already exists, skipping...');
        } else {
          console.error('❌ Error executing statement:', statement.substring(0, 100));
          throw error;
        }
      }
    }

    connection.release();

    console.info('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
