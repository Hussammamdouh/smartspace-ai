const mongoose = require('mongoose');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');

// Custom error class for API errors
class APIError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    console.error('Error 💥:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      user: req.user ? req.user.id : 'Not authenticated'
    });

    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Production error response
  let error = { ...err };
  error.message = err.message;

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map(el => el.message);
    error = new APIError(`Invalid input data: ${errors.join('. ')}`, 400);
  }

  // Handle JWT errors
  if (err instanceof JsonWebTokenError) {
    error = new APIError('Invalid token. Please log in again.', 401);
  }

  if (err instanceof TokenExpiredError) {
    error = new APIError('Your token has expired. Please log in again.', 401);
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new APIError(`Duplicate field value: ${field}. Please use another value.`, 400);
  }

  // Handle mongoose cast errors (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = new APIError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    error = new APIError(`File upload error: ${err.message}`, 400);
  }

  // Handle axios errors
  if (err.isAxiosError) {
    error = new APIError( 
      err.response?.data?.message || 'External API request failed',
      err.response?.status || 500
    );
  }

  // Handle unknown errors
  if (!error.isOperational) {
    error = new APIError('Something went wrong', 500, false);
  }

  // Send error response
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message
  });
};

module.exports = {
  errorHandler,
  APIError
};
