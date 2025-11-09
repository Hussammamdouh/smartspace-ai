const express = require('express');
const { protect, admin } = require('../middlewares/auth');
const { createOrder, getOrders, getOrderById, updateOrderStatus, getUserOrders, getAllOrders, cancelOrder } = require('../controllers/orderController');
const { validateQuery } = require('../middlewares/validateMiddleware');
const { orderFilterSchema } = require('../utils/validationSchemas');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: "Phase 3: E-Commerce"
 *   description: Shopping cart, order processing, and payment management
 */

/**
 * @swagger
 * /api/orders/user-orders:
 *   get:
 *     summary: Get all orders for the logged-in user (dashboard)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - total
 *               - paymentMethod
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                     - price
 *                   properties:
 *                     productId: { type: string }
 *                     name: { type: string }
 *                     quantity: { type: number }
 *                     price: { type: number }
 *               total: { type: number }
 *               paymentMethod: 
 *                 type: string
 *                 enum: [card, cash-on-delivery]
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   address: { type: string }
 *                   city: { type: string }
 *                   postalCode: { type: string }
 *                   country: { type: string }
 *                   phone: { type: string }
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for the logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         description: Number of results per page
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, completed, cancelled] }
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   patch:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */

// Routes
router.get("/user-orders", protect, getUserOrders);
router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id", protect, updateOrderStatus);
router.delete("/:id", protect, cancelOrder);
router.get('/admin/all', protect, admin, getAllOrders);

module.exports = router;
