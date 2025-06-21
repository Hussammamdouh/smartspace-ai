# AI Interior Design Backend API

A comprehensive backend API for an AI-powered interior design application with chat history, design editing, and multiple AI service integrations.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role-based access
- **AI-Powered Design Generation** - Multiple AI services (OpenAI, Gemini, Replicate)
- **Chat History Management** - Persistent conversation storage with images
- **Design Editing System** - Add/remove furniture from generated designs
- **Inventory Management** - Product catalog with filtering and search
- **Order Management** - Complete e-commerce functionality
- **Real-time Image Generation** - DALL-E 3, Gemini, and Replicate integration
- **Comprehensive API Documentation** - Auto-generated Swagger docs

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, Rate Limiting, XSS Protection

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Environment variables configured

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai-interior-design
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   
   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key
   
   # Google Gemini Configuration
   GEMINI_API_KEY=your-gemini-api-key
   
   # Replicate Configuration
   REPLICATE_API_TOKEN=your-replicate-token
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development with auto-restart
   npm run dev
   ```

## 📚 API Documentation

Once the server is running, the complete API documentation is available at:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/api/health`

The documentation includes:
- All API endpoints with examples
- Request/response schemas
- Authentication requirements
- Error codes and messages
- Interactive testing interface

## 🔐 Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📁 Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── db.js              # Database connection
│   └── swagger.js         # Swagger documentation config
├── controllers/           # Route controllers
│   ├── authController.js  # Authentication logic
│   ├── chatController.js  # Chat history management
│   ├── designController.js # Design generation
│   ├── editDesignController.js # Design editing
│   ├── inventoryController.js # Product management
│   ├── orderController.js # Order processing
│   └── userController.js  # User profile management
├── middlewares/           # Custom middleware
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling
│   ├── uploadMiddleware.js # File upload handling
│   └── validateMiddleware.js # Request validation
├── models/               # Database models
│   ├── ChatHistory.js    # Chat conversation model
│   ├── Design.js         # Design preferences
│   ├── GeneratedDesign.js # Generated designs
│   ├── InventoryItem.js  # Product inventory
│   ├── Order.js          # Order management
│   └── User.js           # User model
├── routes/               # API routes
│   ├── authRoutes.js     # Authentication routes
│   ├── chatRoutes.js     # Chat history routes
│   ├── designRoutes.js   # Design generation routes
│   ├── editDesignRoutes.js # Design editing routes
│   ├── inventoryRoutes.js # Product routes
│   ├── orderRoutes.js    # Order routes
│   └── userRoutes.js     # User profile routes
├── services/             # Business logic
│   ├── designService.js  # Design generation logic
│   ├── inventoryService.js # Product management
│   ├── openaiService.js  # OpenAI integration
│   └── orderService.js   # Order processing
├── utils/                # Utility functions
│   ├── logger.js         # Logging utility
│   ├── paginate.js       # Pagination helper
│   └── validationSchemas.js # Joi validation schemas
├── uploads/              # File uploads directory
├── logs/                 # Application logs
├── server.js             # Main application file
└── package.json          # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/designs` - Get user designs
- `GET /api/users/purchases` - Get user orders

### Design Generation
- `POST /api/design` - Generate new design
- `GET /api/design` - Get user designs
- `GET /api/design/:id` - Get specific design
- `DELETE /api/design/:id` - Delete design

### Design Editing
- `GET /api/edit-design/:id` - Get design for editing
- `GET /api/edit-design/furniture` - Get available furniture
- `POST /api/edit-design/:id/edit` - Edit design
- `GET /api/edit-design/:id/history` - Get edit history
- `POST /api/edit-design/:id/preferences` - Save edit preferences
- `GET /api/edit-design/:id/export` - Export design

### Chat History
- `GET /api/chat/history` - Get chat conversations
- `GET /api/chat/conversation/:id` - Get specific conversation
- `POST /api/chat/conversation` - Start new conversation
- `POST /api/chat/message` - Send message
- `DELETE /api/chat/conversation/:id` - Delete conversation
- `PUT /api/chat/conversation/:id/title` - Update conversation title

### Inventory Management
- `GET /api/inventory` - Get products with filtering
- `GET /api/inventory/:id` - Get specific product
- `POST /api/inventory` - Add new product (Admin)
- `PUT /api/inventory/:id` - Update product (Admin)
- `DELETE /api/inventory/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders

### AI Services
- `POST /api/chatbot/unified` - OpenAI chat and image generation
- `POST /api/gemini/generate-image` - Gemini image generation
- `POST /api/replicate/generate` - Replicate image generation

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Prevent abuse with request limits
- **Input Validation** - Joi schema validation
- **XSS Protection** - Cross-site scripting prevention
- **MongoDB Sanitization** - NoSQL injection prevention
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 🧪 Testing

The API includes comprehensive error handling and validation. Test endpoints using:

1. **Swagger UI** - Interactive testing at `/api-docs`
2. **Postman** - Import the collection
3. **cURL** - Command line testing

## 📊 Monitoring

- **Health Check** - `/api/health` endpoint
- **Logging** - Structured logging with different levels
- **Error Tracking** - Centralized error handling

## 🚀 Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure production MongoDB URI
   - Set secure JWT secret

2. **Process Management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "ai-interior-design"
   ```

3. **Reverse Proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review the health check at `/api/health`
- Check application logs in the `logs/` directory
