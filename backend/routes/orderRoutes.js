const express = require('express');
const { protect } = require('../middlewares/auth');
const { createOrder, getOrders } = require('../controllers/orderController');
const { validateQuery } = require('../middlewares/validateMiddleware');
const { orderFilterSchema } = require('../utils/validationSchemas');

const router = express.Router();

// ✅ Now correctly use createOrder directly
router.post("/", protect, createOrder);
router.get("/", protect, getOrders);

module.exports = router;
