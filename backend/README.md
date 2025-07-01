# AI Interior Design Backend API

A comprehensive Node.js/Express backend API for the AI Interior Design application, featuring user authentication, design generation, inventory management, and email verification.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Email verification system
  - Password reset functionality
  - Role-based access control (User/Admin)

- **AI-Powered Design Generation**
  - OpenAI DALL-E 3 integration
  - Google Gemini integration
  - Replicate AI integration
  - Design preference management

- **Inventory Management**
  - Product catalog with filtering and pagination
  - Image upload functionality
  - Stock management
  - Category and style organization

- **Order Management**
  - Shopping cart functionality
  - Order processing and tracking
  - Payment integration support

- **Security Features**
  - Rate limiting
  - Input validation and sanitization
  - CORS protection
  - Helmet security headers
  - XSS protection

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   
   # Database
   MONGO_URI=mongodb://localhost:27017/ai-interior-design
   
   # JWT Secrets
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   
   # Email Configuration (Development)
   EMAIL_SERVICE=Gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   
   # Email Configuration (Production)
   SMTP_HOST=smtp.your-provider.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   
   # AI Services
   OPENAI_API_KEY=your-openai-api-key
   GEMINI_API_KEY=your-gemini-api-key
   REPLICATE_API_TOKEN=your-replicate-token
   
   # Frontend URLs (for CORS)
   FRONTEND_URL=http://localhost:5173
   ADMIN_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

The API documentation is available at `/api-docs` when the server is running.

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh-token` | Refresh access token | No |
| GET | `/auth/verify-email/:token` | Verify email address | No |
| POST | `/auth/resend-verification` | Resend verification email | No |
| GET | `/auth/me` | Get current user | Yes |
| PATCH | `/auth/updatePassword` | Update password | Yes |
| POST | `/auth/forgotPassword` | Request password reset | No |
| PATCH | `/auth/resetPassword/:token` | Reset password | No |
| GET | `/auth/logout` | Logout user | Yes |

### Inventory Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/inventory` | Get all products | No |
| GET | `/inventory/:id` | Get product by ID | No |
| POST | `/inventory/test-upload` | Test file upload | No |
| POST | `/inventory` | Add new product | Admin |
| PUT | `/inventory/:id` | Update product | Admin |
| DELETE | `/inventory/:id` | Delete product | Admin |

### Design Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/design` | Get user designs | Yes |
| GET | `/design/:id` | Get design by ID | Yes |
| POST | `/design` | Create new design | Yes |
| DELETE | `/design/:id` | Delete design | Yes |
| POST | `/design/preferences` | Save design preferences | Yes |
| POST | `/design/generate` | Generate AI design | Yes |

### AI Service Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chatbot` | OpenAI chat completion | Yes |
| POST | `/gemini` | Google Gemini chat | Yes |
| POST | `/replicate` | Replicate AI generation | Yes |

## 🔧 Configuration

### Environment Variables

#### Required Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens

#### Optional Variables
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 5000)
- `EMAIL_*`: Email configuration
- `OPENAI_API_KEY`: OpenAI API key
- `GEMINI_API_KEY`: Google Gemini API key
- `REPLICATE_API_TOKEN`: Replicate API token

### Database Configuration

The application uses MongoDB with Mongoose ODM. Key features:
- Automatic connection management
- Index optimization for performance
- Soft delete functionality
- Data validation and sanitization

### File Upload Configuration

- **Supported formats**: JPEG, PNG, WebP, GIF
- **Maximum file size**: 5MB
- **Storage location**: `uploads/` directory
- **File naming**: Timestamp + sanitized original name

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Configure production database URL
   - Set up production email service
   - Configure CORS origins

2. **Security**
   - Use strong JWT secrets
   - Enable HTTPS
   - Configure proper CORS settings
   - Set up rate limiting

3. **Performance**
   - Enable database indexes
   - Configure proper logging
   - Set up monitoring

4. **File Storage**
   - Consider using cloud storage (AWS S3, Google Cloud Storage)
   - Configure proper file permissions
   - Set up backup strategies

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB is running
   - Verify `MONGO_URI` is correct
   - Check network connectivity

2. **Email Not Sending**
   - Verify email credentials
   - Check SMTP settings
   - Ensure app passwords are used for Gmail

3. **File Upload Issues**
   - Check `uploads/` directory permissions
   - Verify file size limits
   - Check supported file formats

4. **JWT Token Issues**
   - Verify JWT secrets are set
   - Check token expiration times
   - Ensure proper token format

### Logs

Application logs are stored in:
- `logs/combined.log`: All logs
- `logs/error.log`: Error logs only

### Health Check

Use the health check endpoint to verify system status:
```bash
curl http://localhost:5000/api/health
```

## 📝 Development

### Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middlewares/     # Custom middlewares
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── uploads/         # File uploads
├── logs/            # Application logs
└── server.js        # Entry point
```

### Adding New Features

1. **Create Model** (if needed)
   - Add to `models/` directory
   - Include proper validation and indexes

2. **Create Controller**
   - Add to `controllers/` directory
   - Follow error handling patterns

3. **Create Routes**
   - Add to `routes/` directory
   - Include proper validation and authentication

4. **Update Documentation**
   - Add Swagger documentation
   - Update this README

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review the logs in `logs/` directory
- Use the health check endpoint
- Contact the development team
