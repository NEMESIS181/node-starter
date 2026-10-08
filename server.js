import './config/env.js';
import mongoose from 'mongoose';

import app from './app.js';
import connectDB from './config/database.js';
import logger from './config/logger.js';

const port = process.env.PORT || 3000;
let server;

const shutdown = (exitCode) => {
  setTimeout(() => process.exit(1), 10000).unref();

  if (!server) {
    process.exit(exitCode);
  }

  server.close(async () => {
    await mongoose.connection.close();
    logger.info('💥 Process terminated!');
    process.exit(exitCode);
  });
};

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  shutdown(1);
});

// Graceful shutdown
['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => {
    logger.info(`👋 ${signal} RECEIVED. Shutting down gracefully`);
    shutdown(0);
  });
});

const start = async () => {
  await connectDB();

  server = app.listen(port, () => {
    logger.info(`Server is up on port ${port} (${process.env.NODE_ENV})`);
  });

  server.on('error', (err) => {
    logger.error('Error starting the server:', err);
    process.exit(1);
  });
};

start();
