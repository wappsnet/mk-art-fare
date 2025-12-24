import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runSpecificMigration = async (migrationFile) => {
  try {
    console.info(`🔄 Running migration: ${migrationFile}`);

    const migrationPath = path.join(__dirname, '../../..', 'database', 'migrations', migrationFile);

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    const connection = await pool.getConnection();

    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.info('✅ Executed:', statement.substring(0, 80) + '...');
      } catch (error) {
        console.error('❌ Error executing statement:', statement.substring(0, 100));
        console.error('Error:', error.message);
        throw error;
      }
    }

    connection.release();

    console.info('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Get migration file from command line argument
const migrationFile = process.argv[2] || '004_ensure_numeric_types.sql';
runSpecificMigration(migrationFile);
