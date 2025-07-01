const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, restrictTo } = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');
const { validate, validateQuery } = require('../middlewares/validateMiddleware');
const { inventoryItemSchema, inventoryFilterSchema } = require('../utils/validationSchemas');

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Product inventory management endpoints
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items with filtering and pagination
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter by category
 *       - in: query
 *         name: style
 *         schema: { type: string }
 *         description: Filter by style
 *       - in: query
 *         name: color
 *         schema: { type: string }
 *         description: Filter by color
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *         description: Maximum price filter
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 9 }
 *         description: Number of items per page
 *       - in: query
 *         name: ids
 *         schema: { type: string }
 *         description: Comma-separated list of product IDs
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryItem'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total: { type: number }
 *                     page: { type: number }
 *                     totalPages: { type: number }
 */

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get a specific inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Item not found
 */

/**
 * @swagger
 * /api/inventory/test-upload:
 *   post:
 *     summary: Test file upload functionality
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file
 *       500:
 *         description: Upload failed
 */

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Add a new inventory item (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - price
 *               - stock
 *             properties:
 *               name: { type: string }
 *               type: { type: string }
 *               price: { type: number }
 *               stock: { type: number }
 *               file: 
 *                 type: string
 *                 format: binary
 *                 description: Product image
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               type: { type: string }
 *               price: { type: number }
 *               stock: { type: number }
 *               file: 
 *                 type: string
 *                 format: binary
 *                 description: Product image
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Item not found
 */

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Item not found
 */

// Public routes (no authentication required)
router.get("/", validateQuery(inventoryFilterSchema), inventoryController.getInventory);
router.get("/:id", inventoryController.getInventoryItem);

// Test upload route (public)
router.post('/test-upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post("/", upload.single("file"), validate(inventoryItemSchema), inventoryController.addInventoryItem);
router.put("/:id", upload.single("file"), inventoryController.updateInventoryItem);
router.delete("/:id", inventoryController.deleteInventoryItem);

module.exports = router;
