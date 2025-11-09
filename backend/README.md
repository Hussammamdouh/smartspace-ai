# AI Interior Design Backend

A robust Node.js backend for the AI Interior Design application with comprehensive error handling, cloud storage, and cost estimation features.

## 🚀 Features

- **AI Integration**: OpenAI DALL-E 3 for image generation
- **Database Integration**: MongoDB with Mongoose ODM
- **Cloud Storage**: Cloudinary integration for image storage
- **Cost Estimation**: Automatic furniture cost calculation
- **Chat History**: Persistent conversation storage
- **Security**: JWT authentication, rate limiting, input sanitization
- **Monitoring**: Comprehensive health checks and logging
- **API Documentation**: Swagger/OpenAPI documentation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- OpenAI API key
- Cloudinary account (optional but recommended)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory with the following variables:

   ```env
   # Required
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ai-interior-design
   JWT_SECRET=your-super-secret-jwt-key-here
   OPENAI_API_KEY=your-openai-api-key-here

   # Optional but recommended
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Optional
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `OPENAI_API_KEY` | Yes | OpenAI API key for DALL-E |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `EMAIL_USER` | No | Email service username |
| `EMAIL_PASS` | No | Email service password |

### Database Setup

The application will automatically create the necessary collections and indexes when it starts. Make sure your MongoDB instance is running and accessible.

## 📚 API Documentation

Once the server is running, you can access the API documentation at:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/api/health`

## 🔍 Health Check

The health check endpoint (`/api/health`) monitors:
- Database connectivity
- OpenAI API configuration
- Cloudinary configuration
- Email service configuration
- Environment variables
- System resources

## 🗂️ Project Structure

```
backend/
├── config/           # Configuration files
│   ├── db.js        # Database configuration
│   ├── cloudinary.js # Cloudinary configuration
│   └── swagger.js   # API documentation
├── controllers/      # Route controllers
├── middlewares/      # Express middlewares
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── uploads/         # Local file storage
├── logs/            # Application logs
└── server.js        # Main application file
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Sanitization**: MongoDB injection protection
- **XSS Protection**: Cross-site scripting prevention
- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing

## 📊 Cost Estimation System

The backend automatically calculates furniture costs when generating designs:

1. **Furniture Selection**: AI selects appropriate furniture from inventory
2. **Cost Calculation**: Total cost is calculated based on selected items
3. **Budget Tracking**: Design preferences include budget constraints
4. **Cost History**: All designs include cost metadata for analysis

## 🗄️ Database Models

### User
- Authentication and profile information
- Role-based access control
- Email verification and password reset

### InventoryItem
- Furniture catalog with categories, styles, and prices
- Stock management and availability tracking
- Soft delete support

### GeneratedDesign
- AI-generated design images
- Cost estimation and furniture mapping
- Edit history and version control

### ChatHistory
- Persistent conversation storage
- Message types (text/image)
- Design references and metadata

### DesignPreference
- User design preferences
- Budget constraints and cost tracking
- Usage analytics

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Global Error Handler**: Catches all unhandled errors
- **Custom Error Classes**: APIError for operational errors
- **Logging**: Winston-based logging with file and console output
- **Graceful Degradation**: Fallback mechanisms for external services

## 📝 Logging

Logs are stored in the `logs/` directory:
- `combined.log`: All application logs
- `error.log`: Error-level logs only

Log levels: `error`, `warn`, `info`, `debug`

## 🔄 File Upload

### Local Storage (Fallback)
- Files stored in `uploads/` directory
- Automatic cleanup of temporary files
- Configurable file size limits

### Cloudinary (Primary)
- Automatic upload to cloud storage
- Image optimization and transformation
- Secure URL generation
- Automatic fallback to local storage

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**: Set all required production variables
2. **Database**: Use production MongoDB instance
3. **Cloudinary**: Configure for production use
4. **Logging**: Configure production log levels
5. **Security**: Review security headers and CORS settings
6. **Monitoring**: Set up health check monitoring

### Docker Deployment

```dockerfile
FROM node:16-alpine
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
   - Check MongoDB URI and network connectivity
   - Verify database permissions

2. **OpenAI API Errors**
   - Verify API key is valid and has sufficient credits
   - Check rate limits and usage quotas

3. **File Upload Issues**
   - Verify Cloudinary credentials (if using cloud storage)
   - Check file size limits and supported formats
   - Ensure uploads directory has write permissions

4. **JWT Token Issues**
   - Verify JWT_SECRET is set and secure
   - Check token expiration settings

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## 📞 Support

For issues and questions:
1. Check the health check endpoint
2. Review application logs
3. Verify environment configuration
4. Test individual API endpoints

## 🔄 Updates

To update the application:
1. Pull latest changes
2. Install new dependencies: `npm install`
3. Run database migrations if needed
4. Restart the application

## 📄 License

This project is part of the AI Interior Design application.

## Cloudinary Image Management

- All uploaded images (inventory, user avatars) and generated design images are stored in Cloudinary.
- The Cloudinary `public_id` is saved in the database for each image.
- When a record is deleted or an image is replaced, the old Cloudinary image is deleted automatically.
- A migration utility is provided to clean up orphaned Cloudinary images (those not referenced in the DB).
- For new features, always:
  - Store the Cloudinary `public_id` in the relevant model.
  - Delete the Cloudinary image when the record is deleted or the image is replaced.
  - Use the provided upload middleware or follow the pattern in `aiImageService.js` for generated images.
