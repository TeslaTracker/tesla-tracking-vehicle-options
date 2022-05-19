import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  defaultMeta: { service: 'tracker' },
  transports: [],
});

if (process.env.NODE_ENV !== 'development') {
  logger.add(new winston.transports.Console());
}

export default logger;
