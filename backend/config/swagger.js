const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Interior Design API - Complete Documentation',
      version: '2.0.0',
      description: `
# AI Interior Design Platform API Documentation

This comprehensive API documentation is organized by implementation phases to help you understand and test the complete functionality.

## 📋 Implementation Phases

### Phase 1: Authentication & User Management
- User registration with email verification
- Login/logout with JWT tokens
- Password reset functionality
- User profile management

### Phase 2: Admin Panel & Management
- Product inventory management
- User management
- Order processing
- System analytics

### Phase 3: E-Commerce & Shopping
- Product catalog with filtering
- Shopping cart functionality
- Order placement and tracking
- Payment processing

### Phase 4: AI-Powered Design Generation
- Design preference management
- AI image generation (OpenAI DALL-E 3)
- Design editing and iteration
- Furniture matching

### Phase 5: AI Chat Assistant
- Conversational AI interface
- Design consultation
- Multi-model AI support
- Chat history management

### Phase 6: System & Monitoring
- Health checks
- Performance monitoring
- Error handling
- API documentation

## 🔐 Authentication

All protected endpoints require a valid JWT token in the Authorization header:
\`Authorization: Bearer <your-jwt-token>\`

## 📝 Testing Guidelines

1. **Start with Phase 1** - Register a user and get authentication tokens
2. **Test each phase sequentially** - Each phase builds upon the previous
3. **Use the provided examples** - All endpoints include realistic test data
4. **Check response formats** - All responses follow standardized format
5. **Monitor error responses** - Test both success and error scenarios

## 🚀 Quick Start

1. Register a new user: \`POST /api/auth/register\`
2. Verify email: \`GET /api/auth/verify-email/{token}\`
3. Login: \`POST /api/auth/login\`
4. Use the returned token for authenticated requests

---

**Base URL**: http://localhost:5000/api
**Documentation**: http://localhost:5000/api-docs
**Health Check**: http://localhost:5000/api/health
      `,
      contact: {
        name: 'AI Interior Design API Support',
        email: 'support@aiinteriordesign.com',
        url: 'https://aiinteriordesign.com/support'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.aiinteriordesign.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint. Include in Authorization header: Bearer <token>'
        }
      },
      schemas: {
        // ===== PHASE 1: AUTHENTICATION SCHEMAS =====
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
            emailVerified: { type: 'boolean', default: false },
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
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'passwordConfirm', 'phone'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 8, example: 'Password123!' },
            passwordConfirm: { type: 'string', example: 'Password123!' },
            phone: { type: 'string', pattern: '^(010|011|012|015)\\d{8}$', example: '01012345678' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'Password123!' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Login successful' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['password', 'passwordConfirm'],
          properties: {
            password: { type: 'string', minLength: 8, example: 'NewPassword123!' },
            passwordConfirm: { type: 'string', example: 'NewPassword123!' }
          }
        },

        // ===== PHASE 2: ADMIN & INVENTORY SCHEMAS =====
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
            description: { type: 'string', example: 'Comfortable modern sofa with premium fabric' },
            available: { type: 'boolean', default: true },
            stock: { type: 'number', default: 1 },
            isDeleted: { type: 'boolean', default: false },
            image: { type: 'string', example: 'uploads/sofa.jpg' },
            tags: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['modern', 'comfortable', 'gray', 'sofa']
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateInventoryItemRequest: {
          type: 'object',
          required: ['name', 'category', 'price'],
          properties: {
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
            stock: { type: 'number', default: 1 },
            tags: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['modern', 'comfortable', 'gray']
            }
          }
        },
        UpdateInventoryItemRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Updated Modern Sofa' },
            category: { 
              type: 'string', 
              enum: ['bedroom', 'child bedroom', 'kitchen', 'bathroom', 'living room']
            },
            style: { type: 'string', example: 'contemporary' },
            color: { type: 'string', example: 'navy' },
            price: { type: 'number', example: 1800 },
            description: { type: 'string', example: 'Updated description' },
            available: { type: 'boolean', example: true },
            stock: { type: 'number', example: 5 },
            tags: { 
              type: 'array', 
              items: { type: 'string' }
            }
          }
        },
        InventoryFilterQuery: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, example: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, example: 10 },
            category: { 
              type: 'string', 
              enum: ['bedroom', 'child bedroom', 'kitchen', 'bathroom', 'living room']
            },
            style: { type: 'string', example: 'modern' },
            color: { type: 'string', example: 'gray' },
            minPrice: { type: 'number', minimum: 0, example: 100 },
            maxPrice: { type: 'number', minimum: 0, example: 2000 },
            available: { type: 'boolean', example: true },
            search: { type: 'string', example: 'sofa' }
          }
        },

        // ===== PHASE 3: E-COMMERCE & ORDERS SCHEMAS =====
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
            shippingAddress: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'John Doe' },
                address: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'Cairo' },
                postalCode: { type: 'string', example: '12345' },
                country: { type: 'string', example: 'Egypt' },
                phone: { type: 'string', example: '01012345678' }
              }
            },
            isPaid: { type: 'boolean', default: false },
            paidAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['products', 'total', 'paymentMethod', 'shippingAddress'],
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                required: ['productId', 'quantity', 'price'],
                properties: {
                  productId: { type: 'string', example: '507f1f77bcf86cd799439012' },
                  quantity: { type: 'number', minimum: 1, example: 1 },
                  price: { type: 'number', minimum: 0, example: 1500 }
                }
              }
            },
            total: { type: 'number', minimum: 0, example: 1500 },
            paymentMethod: { 
              type: 'string', 
              enum: ['card', 'cash-on-delivery'],
              example: 'card'
            },
            shippingAddress: {
              type: 'object',
              required: ['name', 'address', 'city', 'country', 'phone'],
              properties: {
                name: { type: 'string', example: 'John Doe' },
                address: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'Cairo' },
                postalCode: { type: 'string', example: '12345' },
                country: { type: 'string', example: 'Egypt' },
                phone: { type: 'string', example: '01012345678' }
              }
            }
          }
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { 
              type: 'string', 
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              example: 'processing'
            }
          }
        },

        // ===== PHASE 4: AI DESIGN GENERATION SCHEMAS =====
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
        CreateDesignPreferenceRequest: {
          type: 'object',
          required: ['roomType', 'style', 'colorPalette'],
          properties: {
            roomType: { type: 'string', example: 'living room' },
            style: { type: 'string', example: 'modern' },
            colorPalette: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['gray', 'white', 'blue']
            },
            dimensions: { type: 'string', example: '5x7 meters' },
            budget: { type: 'number', example: 2000 },
            additionalNotes: { type: 'string', example: 'Include a large sofa and TV' }
          }
        },
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
        GenerateDesignRequest: {
          type: 'object',
          required: ['preferenceId'],
          properties: {
            preferenceId: { type: 'string', example: '507f1f77bcf86cd799439014' }
          }
        },
        EditDesignRequest: {
          type: 'object',
          required: ['action', 'furnitureItems'],
          properties: {
            action: { type: 'string', enum: ['add', 'remove', 'modify'], example: 'add' },
            furnitureItems: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439012']
            },
            prompt: { type: 'string', example: 'Add a coffee table to the living room' },
            originalImageUrl: { type: 'string', example: 'https://example.com/original.jpg' }
          }
        },

        // ===== PHASE 5: AI CHAT ASSISTANT SCHEMAS =====
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
        StartConversationRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Living Room Design Consultation' }
          }
        },
        SendMessageRequest: {
          type: 'object',
          required: ['conversationId', 'message'],
          properties: {
            conversationId: { type: 'string', example: '507f1f77bcf86cd799439016' },
            message: { type: 'string', example: 'I want a modern living room design' },
            model: { type: 'string', enum: ['chat', 'image'], default: 'chat' }
          }
        },
        UpdateConversationTitleRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Updated Conversation Title' }
          }
        },

        // ===== PHASE 6: AI SERVICES SCHEMAS =====
        AIPromptRequest: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt: { 
              type: 'string', 
              minLength: 1, 
              maxLength: 1000,
              example: 'Generate a modern living room design with gray sofa and white walls'
            }
          }
        },
        AIChatRequest: {
          type: 'object',
          required: ['messages'],
          properties: {
            messages: {
              type: 'array',
              items: {
                type: 'object',
                required: ['role', 'content'],
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                  content: { type: 'string' }
                }
              }
            }
          }
        },

        // ===== COMMON RESPONSE SCHEMAS =====
        FileUploadResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'File uploaded successfully' },
            data: {
              type: 'object',
              properties: {
                filename: { type: 'string', example: '1745933207206-image.jpg' },
                originalname: { type: 'string', example: 'image.jpg' },
                mimetype: { type: 'string', example: 'image/jpeg' },
                size: { type: 'number', example: 1024000 },
                path: { type: 'string', example: 'uploads/1745933207206-image.jpg' }
              }
            }
          }
        },
        HealthCheckResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'AI Interior Design API health check' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string', example: '2.0.0' },
            environment: { type: 'string', example: 'development' },
            services: {
              type: 'object',
              properties: {
                database: { type: 'object' },
                email: { type: 'object' },
                openai: { type: 'object' }
              }
            },
            uptime: { type: 'number', example: 3600 },
            memory: {
              type: 'object',
              properties: {
                rss: { type: 'number' },
                heapTotal: { type: 'number' },
                heapUsed: { type: 'number' },
                external: { type: 'number' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Something went wrong' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Data retrieved successfully' },
            data: { type: 'array' },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 50 },
                totalPages: { type: 'number', example: 5 }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Phase 1: Authentication',
        description: 'User registration, login, email verification, and password management'
      },
      {
        name: 'Phase 2: Admin & Inventory',
        description: 'Product management, user administration, and system management'
      },
      {
        name: 'Phase 3: E-Commerce',
        description: 'Shopping cart, order processing, and payment management'
      },
      {
        name: 'Phase 4: AI Design Generation',
        description: 'Design preferences, AI image generation, and design editing'
      },
      {
        name: 'Phase 5: AI Chat Assistant',
        description: 'Conversational AI, chat history, and design consultation'
      },
      {
        name: 'Phase 6: AI Services',
        description: 'Direct AI service integrations (OpenAI, Gemini, Replicate)'
      },
      {
        name: 'System & Monitoring',
        description: 'Health checks, performance monitoring, and system status'
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
