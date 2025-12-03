import fs from 'fs';
import path from 'path';
import pool from '../config/database';

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migration...');

    const schemaPath = path.join(__dirname, '../../..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    const connection = await pool.getConnection();

    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log('✅ Executed statement');
      } catch (error: any) {
        if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
          console.error('❌ Error executing statement:', statement.substring(0, 100));
          throw error;
        } else {
          console.log('⚠️  Table already exists, skipping...');
        }
      }
    }

    connection.release();

    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
