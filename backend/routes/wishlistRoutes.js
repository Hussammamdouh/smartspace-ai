const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart
} = require('../controllers/wishlistController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist management
 */

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/Wishlist'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId: { type: string }
 *     responses:
 *       200:
 *         description: Product added to wishlist successfully
 *       400:
 *         description: Product already in wishlist
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product removed from wishlist successfully
 *       404:
 *         description: Product not found in wishlist
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/wishlist/clear:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/wishlist/{productId}/move-to-cart:
 *   post:
 *     summary: Move wishlist item to cart
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *         description: Product ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: number, default: 1 }
 *     responses:
 *       200:
 *         description: Product moved to cart successfully
 *       404:
 *         description: Product not found in wishlist
 *       401:
 *         description: Unauthorized
 */

// Routes
router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);
router.delete('/clear', protect, clearWishlist);
router.post('/:productId/move-to-cart', protect, moveToCart);

module.exports = router; 