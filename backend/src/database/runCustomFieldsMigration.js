import fs from 'node:fs';
import path from 'node:path';
import pool from '../config/database.js';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runMigration = async () => {
  let connection;
  try {
    console.log('🔄 Running custom fields migration...');

    const migrationPath = path.join(__dirname, '../../..', 'database', 'migrations', '006_custom_fields_schema.sql');

    console.log('📁 Migration file:', migrationPath);

    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    console.log('📄 Migration file loaded, length:', migrationSql.length);

    connection = await pool.getConnection();

    // Check current database
    const [dbCheck] = await connection.query('SELECT DATABASE() as db');
    console.log('🗄️  Connected to database:', dbCheck[0].db);

    // Split into individual statements
    // First remove all comment lines
    const sqlWithoutComments = migrationSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = sqlWithoutComments
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📊 Found ${statements.length} statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] Executing:`, statement.substring(0, 60) + '...');

      try {
        await connection.query(statement);
        console.log('✅ Success');
      } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Statement:', statement);
        throw error;
      }
    }

    // Verify tables were created
    const [tables] = await connection.query("SHOW TABLES LIKE 'field_%'");
    console.log('\n✅ Tables created:', tables.map(t => Object.values(t)[0]));

    connection.release();
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    if (connection) connection.release();
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
