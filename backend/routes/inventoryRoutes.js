const express = require('express');
const {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryItem
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validate, validateQuery } = require('../middlewares/validateMiddleware');
const { inventoryItemSchema, inventoryFilterSchema } = require('../utils/validationSchemas');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management routes
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of inventory items
 */
router.get('/', validateQuery(inventoryFilterSchema), getInventory);
router.get("/:id", getInventoryItem);

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Add a new inventory item
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - price
 *               - modelPath
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               modelPath:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 */
router.post('/', protect, authorize('admin'), validate(inventoryItemSchema), upload.single('file'), addInventoryItem);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       404:
 *         description: Item not found
 */
router.put('/:id', protect, authorize('admin'), validate(inventoryItemSchema), updateInventoryItem);

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete('/:id', protect, authorize('admin'), deleteInventoryItem);

module.exports = router;
