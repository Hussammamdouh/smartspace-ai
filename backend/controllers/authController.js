const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const { APIError } = require('../middlewares/errorHandler');
const User = require('../models/User');
const { validatePassword } = require('../middlewares/auth');
const { JsonWebTokenError } = require('jsonwebtoken');
const { sendTemplateEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

// Sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m'
  });
};

// Sign refresh token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// Create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: {
      user
    }
  });
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm, phone } = req.body;

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return next(new APIError(passwordErrors.join('. '), 400));
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new APIError('Email already in use', 400));
    }

    // Create user with default role 'user'
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      passwordConfirm,
      phone,
      role: 'user' // Set default role
    });

    // Generate email verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationURL = `${frontendURL}/verify-email/${verificationToken}`;
    
    // Log the verification URL for debugging
    logger.info(`Sending verification email to ${user.email} with URL: ${verificationURL}`);
    
    try {
      await sendTemplateEmail(user.email, 'welcome', {
        name: user.name,
        url: verificationURL
      });
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Remove password from output
    user.password = undefined;
    user.passwordConfirm = undefined;

    // Create tokens
    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email to verify your account.',
      token,
      refreshToken,
      data: {
        user
      }
    });
  } catch (err) {
    logger.error('Registration Error:', err);
    if (err.name === 'ValidationError') {
      return next(new APIError(err.message, 400));
    }
    if (err.code === 11000) {
      return next(new APIError('Email already in use', 400));
    }
    next(new APIError('Error creating user account', 500));
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new APIError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findByEmail(email).select('+password');
    
    // If user doesn't exist or password is incorrect
    if (!user || !(await user.correctPassword(password, user.password))) {
      // Only increment login attempts if user exists
      if (user) {
        await user.incrementLoginAttempts();
      }
      return next(new APIError('Incorrect email or password', 401));
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return next(new APIError('Please verify your email address before logging in. Check your inbox for a verification link.', 401));
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return next(new APIError('Account is locked. Please try again later', 401));
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    user.lastLogin = Date.now();
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Logout user
exports.logout = (req, res) => {
  res.status(200).json({ status: 'success' });
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    // Use findById without the active filter to check the actual status
    const user = await User.findById(req.user.id).select('+active');
    
    if (!user) {
      return next(new APIError('User not found', 404));
    }

    // Check if user is active
    if (!user.active) {
      return next(new APIError('Your account has been deactivated. Please contact support.', 401));
    }

    // Remove sensitive fields
    user.password = undefined;
    user.active = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new APIError('Your current password is incorrect', 401));
    }

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return next(new APIError(passwordErrors.join('. '), 400));
    }

    // Update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    // Get user based on POSTed email
    const user = await User.findByEmail(req.body.email);
    if (!user) {
      return next(new APIError('There is no user with that email address', 404));
    }

    // Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset token to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetPassword/${resetToken}`;
    
    try {
      await sendTemplateEmail(user.email, 'passwordReset', {
        name: user.name,
        url: resetURL
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Password reset token sent to email!'
      });
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      return next(new APIError('Failed to send password reset email. Please try again.', 500));
    }
  } catch (err) {
    next(err);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new APIError('Token is invalid or has expired', 400));
    }

    // Validate new password
    const passwordErrors = validatePassword(req.body.password);
    if (passwordErrors.length > 0) {
      return next(new APIError(passwordErrors.join('. '), 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify email address
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return next(new APIError('Verification token is required', 400));
    }

    logger.info(`Verifying email with token: ${token}`);

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    logger.info(`Hashed token: ${hashedToken}`);

    // Find user with this token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      logger.error(`No user found with token: ${hashedToken}`);
      // Check if token exists but is expired
      const expiredUser = await User.findOne({ emailVerificationToken: hashedToken });
      if (expiredUser) {
        logger.error(`Token found but expired. Expires: ${expiredUser.emailVerificationExpires}, Now: ${Date.now()}`);
        return next(new APIError('Verification token has expired. Please request a new one.', 400));
      }
      // Check if user is already verified (by email)
      const alreadyVerifiedUser = await User.findOne({ emailVerified: true, email: req.query.email });
      if (alreadyVerifiedUser) {
        return res.status(200).json({
          status: 'success',
          message: 'Your email is already verified. You can log in now.'
        });
      }
      return next(new APIError('Invalid verification token', 400));
    }

    // Update user
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      await sendTemplateEmail(user.email, 'emailVerified', {
        name: user.name,
        url: null
      });
    } catch (emailError) {
      logger.error('Failed to send verification confirmation email:', emailError);
    }

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully! You can now log in to your account.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new APIError('Email is required', 400));
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return next(new APIError('No user found with this email address', 404));
    }

    if (user.emailVerified) {
      return next(new APIError('Email is already verified', 400));
    }

    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationURL = `${frontendURL}/verify-email/${verificationToken}`;
    try {
      await sendTemplateEmail(user.email, 'welcome', {
        name: user.name,
        url: verificationURL
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Verification email sent successfully!'
      });
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      return next(new APIError('Failed to send verification email. Please try again.', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new APIError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new APIError('User not found', 404));
    }

    // Generate new tokens
    const token = signToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return next(new APIError('Invalid refresh token', 401));
    }
    next(error);
  }
};
