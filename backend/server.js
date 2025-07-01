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
const { errorHandler } = require('./middlewares/errorHandler');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const designRoutes = require('./routes/designRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const unifiedChatRoutes  = require("./routes/openaiRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const replicateRoutes = require("./routes/replicateRoutes");
const chatRoutes = require("./routes/chatRoutes");
const editDesignRoutes = require("./routes/editDesignRoutes");

const logger = require('./utils/logger');
const app = express();

// ✅ Connect to DB
connectDB();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
    : ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
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
app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

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
// ✅ Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check environment variables
    const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    const healthStatus = {
      status: 'success',
      message: 'AI Interior Design API is running',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        email: process.env.EMAIL_USER ? 'configured' : 'not configured',
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
        gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : null
    };

    const statusCode = missingEnvVars.length > 0 ? 503 : 200;
    res.status(statusCode).json(healthStatus);
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
app.use("/api/chatbot", unifiedChatRoutes);
app.use('/api/gemini', geminiRoutes); 
app.use("/api/replicate", replicateRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/edit-design", editDesignRoutes);

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
