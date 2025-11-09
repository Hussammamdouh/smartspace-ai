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

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const designRoutes = require('./routes/designRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const unifiedChatRoutes  = require("./routes/openaiRoutes");
// Removed Gemini and Replicate integrations
const chatRoutes = require("./routes/chatRoutes");
const editDesignRoutes = require("./routes/editDesignRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const aiRoutes = require("./routes/aiRoutes");

const logger = require('./utils/logger');
const app = express();

// ✅ Connect to DB (async, but don't block server startup)
// In serverless environments, connection will be established on first request
connectDB().catch((error) => {
  logger.error(`Initial DB connection failed: ${error.message}`);
  // In serverless, we'll retry on first request
  if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
    process.exit(1);
  }
});

// ✅ Set server timeout for long-running requests (like image generation)
app.use((req, res, next) => {
  // Set timeout to 5 minutes for all requests
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, check against allowed origins
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        // Allow Vercel preview deployments
        /\.vercel\.app$/,
        /\.vercel\.dev$/
      ].filter(Boolean);
      
      // Check if origin matches any allowed pattern
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development: allow all local origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};
// Use CORS with the configured options
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
// Gemini and Replicate routes removed; using OpenAI-only endpoints
app.use("/api/chat", chatRoutes);
app.use("/api/edit-design", editDesignRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiRoutes);

// ✅ 404 Handler - Must be before error handler
app.use(notFound);

// ✅ Error Handler
app.use(errorHandler);

// ✅ Server Init - Only listen if not running on Vercel
// Vercel will handle the serverless function invocation
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
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
} else {
  logger.info('🚀 Server configured for Vercel deployment');
}

// Export app for Vercel serverless functions
module.exports = app;
