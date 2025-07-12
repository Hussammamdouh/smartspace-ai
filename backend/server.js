require('dotenv').config();
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

// Debug environment variables
console.log('🔧 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
  `✅ Set (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : '❌ Missing');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const designRoutes = require('./routes/designRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const unifiedChatRoutes  = require("./routes/openaiRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const replicateRoutes = require("./routes/replicateRoutes");
const chatRoutes = require("./routes/chatRoutes");
const editDesignRoutes = require("./routes/editDesignRoutes");
const aiRoutes = require("./routes/aiRoutes");

const logger = require('./utils/logger');
const app = express();

// ✅ Connect to DB
connectDB();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
    : ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "http://10.0.2.2:5000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// ✅ Global Middlewares
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(requestLogger);

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

app.use(limiter);

// ✅ Swagger API Docs with custom options
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI Interior Design API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     description: Check the health status of the API and its dependencies
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheckResponse'
 *       503:
 *         description: API is unhealthy (missing environment variables)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheckResponse'
 *       500:
 *         description: Health check failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const { performHealthCheck } = require('./utils/healthCheck');

// ✅ Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = await performHealthCheck();
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      status: healthStatus.status === 'healthy' ? 'success' : 'degraded',
      message: 'AI Interior Design API health check',
      timestamp: healthStatus.checks.timestamp,
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: healthStatus.checks.database,
        email: healthStatus.checks.email,
        openai: healthStatus.checks.openai,
        cloudinary: healthStatus.checks.cloudinary
      },
      uptime: healthStatus.checks.uptime,
      memory: healthStatus.checks.memory
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// ✅ Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/design', designRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use("/api/chatbot", unifiedChatRoutes);
app.use('/api/gemini', geminiRoutes); 
app.use("/api/replicate", replicateRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/edit-design", editDesignRoutes);
app.use("/api/ai", aiRoutes);

// ✅ 404 Handler - Must be before error handler
app.use(notFound);

// ✅ Error Handler
app.use(errorHandler);

// ✅ Server Init
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API Documentation available at: http://localhost:${PORT}/api-docs`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
  
  // Auto-open Swagger docs in development
  if (process.env.NODE_ENV === 'development') {
    const open = require('open');
    setTimeout(() => {
      open(`http://localhost:${PORT}/api-docs`);
    }, 1000);
  }
});
