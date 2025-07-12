const mongoose = require('mongoose');
const logger = require('./logger');
const { testCloudinaryConnection, isCloudinaryAvailable } = require('../config/cloudinary');

/**
 * Check database connection health
 */
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      state: states[state] || 'unknown',
      readyState: state
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * Check OpenAI API health
 */
const checkOpenAIHealth = async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        status: 'not_configured',
        message: 'OpenAI API key not configured'
      };
    }

    // Test the API key with a simple request
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    try {
      // Make a simple test call
      const response = await openai.models.list();
      return {
        status: 'healthy',
        message: 'OpenAI API key is valid and working',
        models: response.data.length
      };
    } catch (apiError) {
      logger.error('OpenAI API test failed:', apiError.message);
      return {
        status: 'unhealthy',
        error: apiError.message,
        message: 'OpenAI API key is invalid or has insufficient permissions'
      };
    }
  } catch (error) {
    logger.error('OpenAI health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * Check Cloudinary health
 */
const checkCloudinaryHealth = async () => {
  try {
    if (!isCloudinaryAvailable()) {
      return {
        status: 'not_configured',
        message: 'Cloudinary not configured (optional service)'
      };
    }

    const isAvailable = await testCloudinaryConnection();
    return {
      status: isAvailable ? 'healthy' : 'unhealthy',
      message: isAvailable ? 'Cloudinary is connected' : 'Cloudinary connection failed'
    };
  } catch (error) {
    logger.error('Cloudinary health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * Check email service health
 */
const checkEmailHealth = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return {
        status: 'not_configured',
        message: 'Email service not configured (optional service)'
      };
    }

    return {
      status: 'configured',
      message: 'Email service is configured'
    };
  } catch (error) {
    logger.error('Email health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * Check environment variables
 */
const checkEnvironmentHealth = () => {
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'OPENAI_API_KEY'
  ];

  const optionalVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];

  const missing = [];
  const configured = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      configured.push(varName);
    }
  });

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      configured.push(varName);
    }
  });

  return {
    status: missing.length === 0 ? 'healthy' : 'degraded',
    required: {
      status: missing.length === 0 ? 'healthy' : 'missing',
      missing,
      configured: configured.filter(v => requiredVars.includes(v))
    },
    optional: {
      configured: configured.filter(v => optionalVars.includes(v))
    }
  };
};

/**
 * Comprehensive health check
 */
const performHealthCheck = async () => {
  const checks = {
    database: await checkDatabaseHealth(),
    openai: await checkOpenAIHealth(),
    cloudinary: await checkCloudinaryHealth(),
    email: await checkEmailHealth(),
    environment: checkEnvironmentHealth(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };

  // Overall health status
  const criticalServices = ['database', 'environment'];
  const criticalHealthy = criticalServices.every(service => 
    checks[service].status === 'healthy' || checks[service].status === 'configured'
  );

  const allHealthy = Object.values(checks)
    .filter(check => typeof check === 'object' && check.status)
    .every(check => check.status === 'healthy' || check.status === 'configured');

  return {
    status: criticalHealthy ? (allHealthy ? 'healthy' : 'degraded') : 'unhealthy',
    checks
  };
};

module.exports = {
  checkDatabaseHealth,
  checkOpenAIHealth,
  checkCloudinaryHealth,
  checkEmailHealth,
  checkEnvironmentHealth,
  performHealthCheck
}; 