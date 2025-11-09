const mongoose = require('mongoose');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

/**
 * Middleware to ensure database connection in serverless environments
 * In serverless (Vercel), connections may be lost between invocations
 */
const ensureDB = async (req, res, next) => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      logger.error('MONGO_URI environment variable is not set');
      return res.status(503).json({
        status: 'error',
        message: 'Database configuration error',
        error: 'MONGO_URI environment variable is not set'
      });
    }

    // Check if we're in a serverless environment
    const isServerless = process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      // Check connection state
      let readyState = mongoose.connection.readyState;
      
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      if (readyState === 0 || readyState === 3) {
        logger.info('Database disconnected, reconnecting...');
        try {
          await connectDB();
          // Wait for connection to be established (with longer timeout for serverless)
          let attempts = 0;
          const maxAttempts = 30; // 3 seconds max wait (increased for serverless)
          while (mongoose.connection.readyState !== 1 && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
          }
          readyState = mongoose.connection.readyState;
        } catch (connectError) {
          logger.error('Failed to connect to database:', connectError);
          const errorMessage = connectError.message || 'Unknown connection error';
          return res.status(503).json({
            status: 'error',
            message: 'Database connection failed',
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? {
              stack: connectError.stack,
              name: connectError.name
            } : undefined
          });
        }
      } else if (readyState === 2) {
        // Already connecting, wait for it to complete
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max wait
        while (mongoose.connection.readyState === 2 && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }
        readyState = mongoose.connection.readyState;
      }
      
      // If still not connected after waiting, it's an error
      if (readyState !== 1) {
        const errorMsg = `Database connection failed. State: ${readyState}. Connection may be timing out or MongoDB URI may be incorrect.`;
        logger.error(errorMsg);
        return res.status(503).json({
          status: 'error',
          message: 'Database connection failed',
          error: errorMsg,
          readyState: readyState
        });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Database connection error in middleware:', error);
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

module.exports = ensureDB;

