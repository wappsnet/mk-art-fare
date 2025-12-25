import fs from 'node:fs';
import path from 'node:path';
import pool from '../config/database.js';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runMigration = async () => {
  let connection;
  try {
    console.info('🔄 Running default_value column migration...');

    const migrationPath = path.join(__dirname, '../../..', 'database', 'migrations', '007_update_default_value_to_json.sql');

    console.info('📁 Migration file:', migrationPath);

    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    console.info('📄 Migration file loaded');

    connection = await pool.getConnection();

    // Check current database
    const [dbCheck] = await connection.query('SELECT DATABASE() as db');
    console.info('🗄️  Connected to database:', dbCheck[0].db);

    // Remove comments and split statements
    const sqlWithoutComments = migrationSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = sqlWithoutComments
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.info(`📊 Executing ${statements.length} statement(s)...`);

    for (const statement of statements) {
      console.info('\nExecuting:', statement.substring(0, 80) + '...');
      await connection.query(statement);
      console.info('✅ Success');
    }

    // Verify the column type was changed
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM field_definitions WHERE Field = 'default_value'"
    );
    console.info('\n✅ Column updated:');
    console.info('  Type:', columns[0].Type);
    console.info('  Null:', columns[0].Null);

    connection.release();
    console.info('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    if (connection) connection.release();
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
