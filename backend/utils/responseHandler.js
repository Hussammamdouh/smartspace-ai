/**
 * Standardized response handler utility
 * Ensures consistent API response format across all endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {any} data - Response data
 * @param {string} message - Success message (default: 'Success')
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    status: 'success',
    message,
    ...(data && { data })
  };

  res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 * @param {any} error - Error details (optional)
 */
const sendError = (res, message = 'Internal server error', statusCode = 500, error = null) => {
  const response = {
    status: 'error',
    message,
    ...(error && process.env.NODE_ENV === 'development' && { error })
  };

  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} meta - Pagination metadata
 * @param {string} message - Success message (default: 'Data retrieved successfully')
 */
const sendPaginated = (res, data, meta, message = 'Data retrieved successfully') => {
  const response = {
    status: 'success',
    message,
    data,
    meta
  };

  res.status(200).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated
}; 