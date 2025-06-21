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
  origin: "http://localhost:5173",
  credentials: true,
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

// ✅ Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Interior Design API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

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
