import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

import logger from './config/logger.js';
import AppError from './utils/appError.js';
import errorHandler from './middlewares/errorHandler.js';
import sanitize from './middlewares/sanitize.js';
import routes from './routes/index.js';

// Initialize Express app
const app = express();

// Trust first proxy
app.set('trust proxy', 1);

// Parse nested query strings
app.set('query parser', 'extended');

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Limit requests from same API
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many requests from this IP, please try again in an hour!' },
});
app.use('/api', limiter);

// Body parsers, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection and parameter pollution
app.use(sanitize({ whitelist: [] }));

// 2) ROUTES
app.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'unavailable',
    db: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

app.use('/api/v1', routes);

app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
