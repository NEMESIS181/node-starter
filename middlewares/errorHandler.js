import logger from '../config/logger.js';
import AppError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  const value = typeof err.value === 'object' ? JSON.stringify(err.value) : err.value;
  const message = `Invalid ${err.path}: ${value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const fields = Object.entries(err.keyValue || {})
    .map(([key, value]) => `${key}: "${value}"`)
    .join(', ');
  const message = `Duplicate field value ${fields}. Please use another value!`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please login again', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please login again', 401);

const handleInvalidJSON = () => new AppError('Invalid JSON in request body', 400);

const handlePayloadTooLarge = () => new AppError('Request body is too large', 413);

const sendErrorDev = (err, req, res) => {
  logger.error(`ERROR 💥 ${req.method} ${req.originalUrl}:`, err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown error
  logger.error(`ERROR 💥 ${req.method} ${req.originalUrl}:`, err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};

// eslint-disable-next-line no-unused-vars
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith('4') ? 'fail' : 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.type === 'entity.parse.failed') error = handleInvalidJSON();
    if (error.type === 'entity.too.large') error = handlePayloadTooLarge();

    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(err, req, res);
  }
};
