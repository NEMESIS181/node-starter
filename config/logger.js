import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`;
});

const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(errors({ stack: true }), timestamp()),
  transports: [
    new transports.Console({
      format: isProduction ? json() : combine(colorize(), logFormat),
    }),
  ],
});

export default logger;
