import dotenv from 'dotenv';
import startApp from './app.js';
import connectDB from './config/database.js';

//Environment Variables configuration
dotenv.config();

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`); // Log error details
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`); // Log error details
  startApp.close(() => {
    process.exit(1); // Exit after server is closed
  });
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  startApp.close(() => {
    logger.info('💥 Process terminated!');
  });
});

(async () => {
  await connectDB();
  startApp();
})();
