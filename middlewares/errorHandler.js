import logger from '../config/logger.js';
import appError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new appError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new appError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new appError(message, 400);
};

const handleJWTError = () => new appError('Invalid token. Please login again', 401);

const handleJWTExpiredError = () => new appError('Your token has expired! Please login again', 401);

const sendErrorDev = (err, req, res) => {
  logger.error(`ERROR 💥: ${err}`);
  logger.error(`ERROR Status💥: ${err.status}`);
  logger.error(`ERROR Message 💥: ${err.message}`);
  logger.error(`ERROR Stack 💥: ${err.stack}`);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    //* If operational error *\\
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      //* If programming error *\\
    }
    //1) Log error
    logger.error(`ERROR 💥: ${err}`);

    //2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  if (!req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: err.message,
      });

      //* If programming error *\\
    }
    //1) Log error
    logger.error(`ERROR 💥: ${err}`);

    //2) Send generic message
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      message: 'Please try again later.',
    });
  }
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 400;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
