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
const signToken = (id, rememberMe = false) => {
  const expiresIn = rememberMe 
    ? process.env.JWT_ACCESS_EXPIRE_REMEMBER || '30d'
    : process.env.JWT_ACCESS_EXPIRE || '15m';
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn
  });
};

// Sign refresh token
const signRefreshToken = (id, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REFRESH_EXPIRE_REMEMBER || '90d'
    : process.env.JWT_REFRESH_EXPIRE || '7d';
  
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn
  });
};

// Create and send token
const createSendToken = (user, statusCode, res, rememberMe = false) => {
  const token = signToken(user._id, rememberMe);
  const refreshToken = signRefreshToken(user._id, rememberMe);

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
    const existingUser = await User.findOne({ email });
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

    // Log registration activity
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    await user.logActivity('account_created', req, { ip: clientIP });

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
    const { email, password, rememberMe } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new APIError('Please provide email and password', 400));
    }

    // Get client IP
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    // If user doesn't exist or password is incorrect
    if (!user || !(await user.correctPassword(password, user.password))) {
      // Only increment login attempts if user exists
      if (user) {
        await user.incrementLoginAttempts();
        await user.logActivity('failed_login', req, { email, reason: 'Invalid credentials' });
      }
      return next(new APIError('Incorrect email or password', 401));
    }

    // Check if email is verified
    if (!user.emailVerified) {
      await user.logActivity('login_blocked', req, { reason: 'Email not verified' });
      return next(new APIError('Please verify your email address before logging in. Check your inbox for a verification link.', 401));
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      await user.logActivity('login_blocked', req, { reason: 'Account locked' });
      return next(new APIError('Account is locked. Please try again later', 401));
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    user.lastLogin = Date.now();
    user.lastLoginIP = clientIP;
    
    // Track login IP
    if (!user.loginIPs) {
      user.loginIPs = [];
    }
    user.loginIPs.push({
      ip: clientIP,
      loginAt: Date.now()
    });
    // Keep only last 10 login IPs
    if (user.loginIPs.length > 10) {
      user.loginIPs.shift();
    }
    
    await user.save();
    await user.logActivity('successful_login', req, { ip: clientIP, rememberMe: !!rememberMe });

    createSendToken(user, 200, res, rememberMe);
  } catch (err) {
    next(err);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // Log logout activity
    const user = await User.findById(req.user.id);
    if (user) {
      await user.logActivity('logout', req, { timestamp: Date.now() });
    }
    res.status(200).json({ status: 'success' });
  } catch (err) {
    // Don't fail logout if logging fails
    res.status(200).json({ status: 'success' });
  }
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
      await user.logActivity('password_change_failed', req, { reason: 'Incorrect current password' });
      return next(new APIError('Your current password is incorrect', 401));
    }

    // Check if new password is same as current password
    if (await user.correctPassword(newPassword, user.password)) {
      return next(new APIError('New password must be different from current password', 400));
    }

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return next(new APIError(passwordErrors.join('. '), 400));
    }

    // Check if password is in history (prevent reuse of last 3 passwords)
    // Note: We check before saving, so passwordHistory hasn't been updated yet
    if (await user.isPasswordInHistory(newPassword)) {
      return next(new APIError('You cannot reuse a recently used password. Please choose a different password.', 400));
    }

    // Update password (password history will be stored in pre-save hook)
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    await user.logActivity('password_changed', req, { timestamp: Date.now() });

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
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset token to user's email - USE FRONTEND URL
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetURL = `${frontendURL}/reset-password/${resetToken}`;
    
    try {
      await sendTemplateEmail(user.email, 'passwordReset', {
        name: user.name,
        url: resetURL
      });
      
      res.status(200).json({
        status: 'success',
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      // Reset the token fields if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
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

    // Check if password is in history
    if (await user.isPasswordInHistory(req.body.password)) {
      return next(new APIError('You cannot reuse a recently used password. Please choose a different password.', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await user.logActivity('password_reset', req, { timestamp: Date.now() });

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

    // Log email verification activity
    await user.logActivity('email_verified', req, { timestamp: Date.now() });

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

    const user = await User.findOne({ email });

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

/**
 * @desc    Change email address
 * @route   PATCH /api/auth/change-email
 * @access  Private
 */
exports.changeEmail = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return next(new APIError('New email and password are required', 400));
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(newEmail)) {
      return next(new APIError('Please provide a valid email address', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Verify password
    if (!(await user.correctPassword(password, user.password))) {
      await user.logActivity('email_change_failed', req, { reason: 'Incorrect password' });
      return next(new APIError('Password is incorrect', 401));
    }

    // Check if new email is same as current
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      return next(new APIError('New email must be different from current email', 400));
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return next(new APIError('Email is already in use', 400));
    }

    // Store old email in history
    if (!user.emailHistory) {
      user.emailHistory = [];
    }
    user.emailHistory.push({
      email: user.email,
      changedAt: Date.now()
    });

    // Update email and mark as unverified
    user.email = newEmail.toLowerCase();
    user.emailVerified = false;

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
      
      await user.logActivity('email_changed', req, { oldEmail: user.emailHistory[user.emailHistory.length - 1].email, newEmail });

      res.status(200).json({
        status: 'success',
        message: 'Email changed successfully. Please verify your new email address.',
        data: {
          user: {
            _id: user._id,
            email: user.email,
            emailVerified: user.emailVerified
          }
        }
      });
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      return next(new APIError('Failed to send verification email. Please try again.', 500));
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return next(new APIError('Password is required to delete account', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Verify password
    if (!(await user.correctPassword(password, user.password))) {
      await user.logActivity('account_deletion_failed', req, { reason: 'Incorrect password' });
      return next(new APIError('Password is incorrect', 401));
    }

    // Soft delete - mark as deleted and deactivate
    user.isDeleted = true;
    user.active = false;
    user.email = `deleted_${Date.now()}_${user.email}`; // Anonymize email
    await user.save({ validateBeforeSave: false });

    await user.logActivity('account_deleted', req, { timestamp: Date.now() });

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get account activity log
 * @route   GET /api/auth/activity
 * @access  Private
 */
exports.getActivityLog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new APIError('User not found', 404));
    }

    // Return last 50 activities
    const activities = (user.activityLog || []).slice(-50).reverse();

    res.status(200).json({
      status: 'success',
      data: {
        activities,
        total: user.activityLog?.length || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get login history
 * @route   GET /api/auth/login-history
 * @access  Private
 */
exports.getLoginHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new APIError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        lastLogin: user.lastLogin,
        lastLoginIP: user.lastLoginIP,
        loginIPs: user.loginIPs || []
      }
    });
  } catch (err) {
    next(err);
  }
};
