import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
  exceptionHandlers: [
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
  rejectionHandlers: [
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

export default logger;
