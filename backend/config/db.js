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
    // Validate MONGO_URI is set
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    // Connection options optimized for serverless
    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds for serverless
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // Added explicit connect timeout
      bufferCommands: false, // Disable mongoose buffering
    };

    logger.info('Attempting to connect to MongoDB...');
    const connection = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    
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
