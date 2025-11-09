const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Cache the connection to reuse in serverless environments
let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection in serverless environments (like Vercel)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.info('Using existing MongoDB connection');
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    
    cachedConnection = connection;
    logger.info('MongoDB connected successfully.');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
      cachedConnection = null;
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      cachedConnection = null;
    });
    
    return connection;
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    // Don't exit process in serverless environments
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      throw error; // Let Vercel handle the error
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
