const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

exports.generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

exports.register = async ({ firstName, lastName, email, password, phone, role }) => {
  const userExists = await User.findOne({ email, isDeleted: false });
  if (userExists) throw new Error('User already exists');

  const user = await User.create({
    name: `${firstName} ${lastName}`,
    email,
    password,
    role,
    phone,
  });

  const { accessToken, refreshToken } = exports.generateTokens(user);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
    accessToken,
    refreshToken,
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email, isDeleted: false });
  if (!user || !(await user.matchPassword(password))) throw new Error('Invalid credentials');

  const { accessToken, refreshToken } = exports.generateTokens(user);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

exports.refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.isDeleted) throw new Error('Invalid refresh token');
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password is required'
  })
}).options({ abortEarly: false, stripUnknown: true });
