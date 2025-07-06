const mongoose = require('mongoose');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const logger = require('../utils/logger');

// Custom API Error class
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new APIError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new APIError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new APIError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new APIError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new APIError(message, 401);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Maximum size is 10MB.';
    error = new APIError(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field.';
    error = new APIError(message, 400);
  }

  // OpenAI API errors
  if (err.type === 'openai_error') {
    const message = err.message || 'OpenAI API error occurred';
    error = new APIError(message, 500);
  }

  // Cloudinary errors
  if (err.http_code && err.http_code >= 400) {
    const message = 'Image upload failed. Please try again.';
    error = new APIError(message, 500);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status: 'error',
      message,
      stack: err.stack,
      error: err
    });
  } else {
    // Production error response
    res.status(statusCode).json({
      status: 'error',
      message: statusCode === 500 ? 'Internal Server Error' : message
    });
  }
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new APIError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  APIError,
  errorHandler,
  notFound,
  asyncHandler
};
