import app from './app.js';
import { config } from './config/index.js';
import pool from './config/database.js';

const startServer = async () => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.info('✅ Database connected successfully');
    connection.release();

    // Start server
    app.listen(config.port, () => {
      console.info(`🚀 Server running on port ${config.port}`);
      console.info(`📝 Environment: ${config.nodeEnv}`);
      console.info(`🌐 API URL: ${config.apiUrl}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.info('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});
