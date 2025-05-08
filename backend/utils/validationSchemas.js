const Joi = require('joi');
const phoneRegex = /^(010|011|012|015)\d{8}$/;

// Registration Schema
const registerSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().required().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  passwordConfirm: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords must match',
    'any.required': 'Please confirm your password'
  }),
  phone: Joi.string().pattern(phoneRegex).required().messages({
    'string.pattern.base': 'Invalid Egyptian phone number format',
    'any.required': 'Phone number is required'
  }),
  role: Joi.string().valid('user', 'admin').default('user')
});

// Login Schema
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
}).options({ abortEarly: false });

// Inventory Item Schema
const inventoryItemSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  price: Joi.number().required(),
  modelPath: Joi.string().required(),
  description: Joi.string().optional(),
});

// Design Schema
const designSchema = Joi.object({
  roomType: Joi.string().required(),
  style: Joi.string().required(),
  measurements: Joi.object().required(),
  notes: Joi.string().optional(),
  designFile: Joi.string().optional(),
});

// Update Profile Schema
const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
});

// Order Body Schema
const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().required(),
        quantity: Joi.number().required(),
        price: Joi.number().required(),
      })
    )
    .required(),
  total: Joi.number().required(),
});

// Inventory Query Filter Schema
const inventoryFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
  type: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  available: Joi.boolean().optional()
});

// Orders Query Filter Schema
const orderFilterSchema = Joi.object({
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional(),
  status: Joi.string().valid('pending', 'completed', 'cancelled').optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  inventoryItemSchema,
  designSchema,
  updateProfileSchema,
  orderSchema,
  inventoryFilterSchema,
  orderFilterSchema,
};
