import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';

import logger from './config/logger.js';
import AppError from './utils/appError.js';
import errorHandler from './middlewares/errorHandler.js';

// Initialize Express app
const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors()); // Allow Cross-Origin requests

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Test middleware
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// 2) ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorHandler);

function startApp() {
  try {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`Server is up on port ${port}`);
    });
  } catch (error) {
    logger.error('Error starting the server:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    process.exit(1); // Ensure the app exits on server startup failure
  }
}

export default startApp;
