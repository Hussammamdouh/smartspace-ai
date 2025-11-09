const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: function() {
      return this.isNew; // Only required for new documents
    },
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  phone: { type: String, required: true },
  address: { type: String },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: { type: String },
  public_id: { type: String }, // Cloudinary public_id for avatar
  gender: { type: String },
  country: { type: String },
  language: { type: String },
  timezone: { type: String },
  emailHistory: [{
    email: String,
    changedAt: Date
  }],
  isDeleted: { type: Boolean, default: false }, // 🔁 Soft delete
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  lastLoginIP: String,
  loginIPs: [{
    ip: String,
    loginAt: Date
  }],
  passwordHistory: [{
    hashedPassword: String,
    changedAt: Date
  }],
  activityLog: [{
    action: String,
    ip: String,
    userAgent: String,
    timestamp: Date,
    details: mongoose.Schema.Types.Mixed
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordConfirm = undefined;
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-save middleware to update passwordChangedAt and store password history
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Store old password in history before hashing new one
  // Note: We need to get the current password hash from DB before it changes
  try {
    const currentDoc = await this.constructor.findById(this._id).select('+password');
    if (currentDoc && currentDoc.password) {
      // Keep only last 3 passwords
      if (!this.passwordHistory) {
        this.passwordHistory = [];
      }
      this.passwordHistory.push({
        hashedPassword: currentDoc.password,
        changedAt: Date.now()
      });
      if (this.passwordHistory.length > 3) {
        this.passwordHistory.shift(); // Remove oldest
      }
    }
  } catch (err) {
    // If error getting current doc, continue anyway
    console.error('Error storing password history:', err);
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Pre-find middleware to exclude inactive users
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  return verificationToken;
};

// Instance method to handle failed login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    return;
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = {
      lockUntil: Date.now() + 15 * 60 * 1000 // 15 minutes
    };
  }

  await this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  await this.updateOne({
    $set: {
      loginAttempts: 0,
      lockUntil: undefined
    }
  });
};

// Instance method to check if password was used recently
userSchema.methods.isPasswordInHistory = async function(candidatePassword) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return false;
  }

  for (const historyItem of this.passwordHistory) {
    const isMatch = await bcrypt.compare(candidatePassword, historyItem.hashedPassword);
    if (isMatch) {
      return true;
    }
  }
  return false;
};

// Instance method to log activity
userSchema.methods.logActivity = async function(action, req, details = {}) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  this.activityLog.push({
    action,
    ip,
    userAgent,
    timestamp: Date.now(),
    details
  });

  // Keep only last 100 activity logs
  if (this.activityLog.length > 100) {
    this.activityLog.shift();
  }

  await this.save({ validateBeforeSave: false });
};

// Add indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ emailVerified: 1 });
userSchema.index({ active: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
