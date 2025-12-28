import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '3308'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'art_fare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Convert Help Center content to EditorJS format
const convertHelpCenter = (content) => ({
  blocks: [
    {
      type: 'header',
      data: {
        text: 'Help Center',
        level: 1,
      },
    },
    {
      type: 'paragraph',
      data: {
        text: content.description || 'Welcome to Art Fare Help Center',
      },
    },
    ...(content.faqSections || []).flatMap((section) => [
      {
        type: 'header',
        data: {
          text: section.title,
          level: 2,
        },
      },
      ...(section.items || []).flatMap((item) => [
        {
          type: 'header',
          data: {
            text: item.question,
            level: 3,
          },
        },
        {
          type: 'paragraph',
          data: {
            text: item.answer,
          },
        },
      ]),
    ]),
  ],
});

// Convert Terms/Privacy content to EditorJS format
const convertLegalPage = (content, title) => ({
  blocks: [
    {
      type: 'header',
      data: {
        text: title,
        level: 1,
      },
    },
    {
      type: 'paragraph',
      data: {
        text: `Last Updated: ${content.lastUpdated || new Date().toLocaleDateString()}`,
      },
    },
    ...(content.sections || []).flatMap((section) => [
      {
        type: 'header',
        data: {
          text: section.title,
          level: 2,
        },
      },
      {
        type: 'paragraph',
        data: {
          text: section.content,
        },
      },
    ]),
  ],
});

// Convert About page to EditorJS format
const convertAboutPage = (content) => ({
  blocks: [
    {
      type: 'header',
      data: {
        text: 'About Art Fare',
        level: 1,
      },
    },
    {
      type: 'header',
      data: {
        text: 'Our Mission',
        level: 2,
      },
    },
    {
      type: 'paragraph',
      data: {
        text: content.mission || 'Connecting artists with collectors worldwide.',
      },
    },
    {
      type: 'header',
      data: {
        text: 'Our Story',
        level: 2,
      },
    },
    ...(content.story || []).map((paragraph) => ({
      type: 'paragraph',
      data: {
        text: paragraph,
      },
    })),
    {
      type: 'header',
      data: {
        text: 'Our Values',
        level: 2,
      },
    },
    {
      type: 'list',
      data: {
        style: 'unordered',
        items: (content.values || []).map((value) => `<b>${value.title}:</b> ${value.description}`),
      },
    },
  ],
});

async function migratePagesToEditorJS() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to database');

    // Get all pages
    const [pages] = await connection.query('SELECT * FROM pages');
    console.log(`Found ${pages.length} pages to migrate`);

    for (const page of pages) {
      console.log(`\nMigrating page: ${page.slug}`);

      let editorData;
      const content = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;

      // Check if already in EditorJS format
      if (content && content.blocks && Array.isArray(content.blocks)) {
        console.log(`  ✓ Page "${page.slug}" is already in EditorJS format`);
        continue;
      }

      // Convert based on page type
      switch (page.slug) {
        case 'help-center':
          editorData = convertHelpCenter(content);
          break;
        case 'terms':
          editorData = convertLegalPage(content, 'Terms of Use');
          break;
        case 'privacy':
          editorData = convertLegalPage(content, 'Privacy Policy');
          break;
        case 'about':
          editorData = convertAboutPage(content);
          break;
        default:
          console.log(`  ⚠ Unknown page type: ${page.slug}`);
          continue;
      }

      // Update page with new format
      await connection.query('UPDATE pages SET content = ? WHERE id = ?', [
        JSON.stringify(editorData),
        page.id,
      ]);
      console.log(`  ✓ Converted "${page.slug}" to EditorJS format`);
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

migratePagesToEditorJS();
