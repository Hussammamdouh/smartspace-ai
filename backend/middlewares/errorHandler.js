const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  let errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Handle validation errors from Joi
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.message = Object.values(err.details || {}).map((detail) => detail.message).join(', ');
  }

  // Handle MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorResponse.message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT Token errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.message = 'Invalid token. Please log in again.';
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
