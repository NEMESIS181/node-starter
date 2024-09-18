import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger.js';
import startApp from '../app.js'; // Make sure startApp is the server instance

// MongoDB connection
const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI;

    if (!connString) {
      logger.error('MONGO_URI missing');
      process.exit(1);
    }

    logger.info(`Connecting to MongoDB... ${connString}`);

    await mongoose.connect(connString);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1); // Ensure the app exits on database connection failure
  }
};

export default connectDB;
