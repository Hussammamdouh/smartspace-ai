const { createLogger, transports, format } = require('winston');
const fs = require('fs');
const path = require('path');

// Check if running on Vercel (serverless environment)
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Create transports array
const loggerTransports = [
  new transports.Console({
    format: format.combine(format.colorize(), format.simple())
  })
];

// Only add file transports if NOT running on Vercel/serverless
if (!isVercel) {
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  loggerTransports.push(
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  );
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: loggerTransports,
});

module.exports = logger;
