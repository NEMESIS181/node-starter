import mongoose from 'mongoose';
import logger from './logger.js';

// MongoDB connection
const connectDB = async () => {
  const connString = process.env.MONGO_URL;

  if (!connString) {
    logger.error('MONGO_URL missing');
    process.exit(1);
  }

  try {
    logger.info('Connecting to MongoDB...');

    await mongoose.connect(connString);
    logger.info(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (error) => logger.error('MongoDB error:', error));
};

export default connectDB;
