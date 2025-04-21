const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { createOrder, getOrders } = require('../controllers/orderController');
const { validate, validateQuery } = require('../middlewares/validateMiddleware');
const { orderSchema, orderFilterSchema  } = require('../utils/validationSchemas');

const router = express.Router();

// Create a new order
router.get('/', protect, validateQuery(orderFilterSchema), getOrders); // orders

// Get orders for a user
router.get('/', protect, getOrders);

module.exports = router;
