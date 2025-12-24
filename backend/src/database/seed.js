import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const seedDatabase = async () => {
  try {
    console.info('🌱 Starting database seeding...');

    const connection = await pool.getConnection();

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email = email`,
      ['admin@artfare.com', adminPassword, 'Admin', 'User', 'admin', true, true]
    );
    console.info('✅ Admin user created');

    // Create sample categories
    const categories = [
      ['Paintings', 'paintings', 'Original paintings and prints'],
      ['Sculptures', 'sculptures', 'Three-dimensional artworks'],
      ['Photography', 'photography', 'Photographic art'],
      ['Digital Art', 'digital-art', 'Digital artwork and NFTs'],
      ['Mixed Media', 'mixed-media', 'Mixed media artwork'],
    ];

    for (const [name, slug, description] of categories) {
      await connection.query(
        `INSERT INTO categories (name, slug, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = name`,
        [name, slug, description]
      );
    }
    console.info('✅ Sample categories created');

    connection.release();

    console.info('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
