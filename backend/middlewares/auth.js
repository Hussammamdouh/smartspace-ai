const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const rateLimit = require('express-rate-limit');
const { APIError } = require('./errorHandler');
const User = require('../models/User');

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many registration attempts from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Protect routes middleware
const protect = async (req, res, next) => {
  try {
    // 1) Check if token exists
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new APIError('You are not logged in. Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('-password');
    if (!currentUser) {
      return next(new APIError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new APIError('User recently changed password. Please log in again.', 401));
    }

    // 5) Check if user is active
    if (!currentUser.active) {
      return next(new APIError('Your account has been deactivated. Please contact support.', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new APIError('Your token has expired. Please log in again.', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new APIError('Invalid token. Please log in again.', 401));
    }
    next(new APIError('Authentication failed. Please log in again.', 401));
  }
};

// Restrict to certain roles (alias for authorize)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new APIError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Role-based access control (alias for restrictTo)
const authorize = (...roles) => {
  return restrictTo(...roles);
};

// Password validation middleware
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

module.exports = {
  protect,
  restrictTo,
  authorize,
  loginLimiter,
  registerLimiter,
  validatePassword
}; 