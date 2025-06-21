const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Interior Design API',
      version: '1.0.0',
      description: 'Complete API documentation for AI Interior Design application',
      contact: {
        name: 'API Support',
        email: 'support@aiinteriordesign.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.aiinteriordesign.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // User Schema
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '01012345678' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            avatar: { type: 'string', example: 'uploads/avatar.jpg' },
            gender: { type: 'string', example: 'male' },
            country: { type: 'string', example: 'Egypt' },
            language: { type: 'string', example: 'en' },
            timezone: { type: 'string', example: 'UTC+2' },
            emailHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  changedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            isDeleted: { type: 'boolean', default: false },
            active: { type: 'boolean', default: true },
            loginAttempts: { type: 'number', default: 0 },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // InventoryItem Schema
        InventoryItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            name: { type: 'string', example: 'Modern Sofa' },
            category: { 
              type: 'string', 
              enum: ['bedroom', 'child bedroom', 'kitchen', 'bathroom', 'living room'],
              example: 'living room'
            },
            style: { type: 'string', example: 'modern' },
            color: { type: 'string', example: 'gray' },
            price: { type: 'number', example: 1500 },
            description: { type: 'string', example: 'Comfortable modern sofa' },
            available: { type: 'boolean', default: true },
            stock: { type: 'number', default: 1 },
            isDeleted: { type: 'boolean', default: false },
            image: { type: 'string', example: 'uploads/sofa.jpg' },
            tags: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['modern', 'comfortable', 'gray']
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // Order Schema
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', example: '507f1f77bcf86cd799439012' },
                  name: { type: 'string', example: 'Modern Sofa' },
                  quantity: { type: 'number', example: 1 },
                  price: { type: 'number', example: 1500 }
                }
              }
            },
            total: { type: 'number', example: 1500 },
            paymentMethod: { 
              type: 'string', 
              enum: ['card', 'cash-on-delivery'],
              example: 'card'
            },
            status: { 
              type: 'string', 
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              default: 'pending'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // DesignPreference Schema
        DesignPreference: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            roomType: { type: 'string', example: 'living room' },
            style: { type: 'string', example: 'modern' },
            colorPalette: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['gray', 'white', 'blue']
            },
            dimensions: { type: 'string', example: '5x7 meters' },
            budget: { type: 'number', example: 2000 },
            additionalNotes: { type: 'string', example: 'Include a large sofa and TV' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        // GeneratedDesign Schema
        GeneratedDesign: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439015' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            preference: { type: 'string', example: '507f1f77bcf86cd799439014' },
            imageUrl: { type: 'string', example: 'https://example.com/design.jpg' },
            relatedProducts: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439012']
            },
            modelUsed: { type: 'string', default: 'DALL·E 3' },
            status: { 
              type: 'string', 
              enum: ['pending', 'success', 'failed'],
              default: 'success'
            },
            originalDesign: { type: 'string', example: '507f1f77bcf86cd799439015' },
            editHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string', enum: ['add', 'remove', 'modify'] },
                  furnitureItems: { 
                    type: 'array', 
                    items: { type: 'string' }
                  },
                  prompt: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            },
            editPreferences: {
              type: 'object',
              properties: {
                furniturePreferences: { 
                  type: 'array', 
                  items: { type: 'string' }
                },
                stylePreferences: { type: 'object' },
                colorPreferences: { type: 'object' },
                notes: { type: 'string' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        // ChatHistory Schema
        ChatHistory: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439016' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            conversation: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant'] },
                  content: { type: 'string' },
                  type: { type: 'string', enum: ['text', 'image'], default: 'text' },
                  imageUrl: { type: 'string' },
                  designId: { type: 'string', example: '507f1f77bcf86cd799439015' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            },
            title: { type: 'string', example: 'Living Room Design' },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // Error Response Schema
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Something went wrong' }
          }
        },
        // Success Response Schema
        Success: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints'
      },
      {
        name: 'User',
        description: 'User profile and management endpoints'
      },
      {
        name: 'Inventory',
        description: 'Product inventory management endpoints'
      },
      {
        name: 'Orders',
        description: 'Order management endpoints'
      },
      {
        name: 'Designs',
        description: 'Design generation and management endpoints'
      },
      {
        name: 'Edit Design',
        description: 'Design editing functionality endpoints'
      },
      {
        name: 'Chat',
        description: 'Chat history and conversation management endpoints'
      },
      {
        name: 'AI Services',
        description: 'AI-powered services (OpenAI, Gemini, Replicate)'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
