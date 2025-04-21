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
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const designRoutes = require('./routes/designRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const unifiedChatRoutes  = require("./routes/openaiRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const replicateRoutes = require("./routes/replicateRoutes");

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

// ✅ Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/design', designRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/chatbot", unifiedChatRoutes);
app.use('/api/gemini', geminiRoutes); 
app.use("/api/replicate", replicateRoutes);


// ✅ Error Handler
app.use(errorHandler);

// ✅ Server Init
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));
