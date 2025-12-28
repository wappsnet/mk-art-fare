import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '3308'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'art_fare',
});

async function verifyEditorJSFormat() {
  let connection;
  try {
    connection = await pool.getConnection();

    const [pages] = await connection.query('SELECT slug, title, content FROM pages');

    console.log('Page Content Verification:\n');

    for (const page of pages) {
      const content = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;

      console.log(`📄 ${page.slug} (${page.title})`);
      console.log(`   Format: ${content.blocks ? '✅ EditorJS' : '❌ Legacy'}`);

      if (content.blocks) {
        console.log(`   Blocks: ${content.blocks.length}`);
        console.log(`   First block: ${content.blocks[0]?.type || 'none'}`);
        console.log(`   Preview: ${content.blocks[0]?.data?.text?.substring(0, 50) || 'N/A'}...`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

verifyEditorJSFormat();
