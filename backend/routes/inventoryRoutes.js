const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, restrictTo } = require('../middlewares/auth');
const { validate, validateQuery } = require('../middlewares/validateMiddleware');
const { inventoryItemSchema, inventoryFilterSchema } = require('../utils/validationSchemas');
const { upload } = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryItem:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Product name
 *         category:
 *           type: string
 *           enum: [bedroom, child bedroom, kitchen, bathroom, living room]
 *           description: Product category
 *         style:
 *           type: string
 *           description: Design style
 *         color:
 *           type: string
 *           description: Product color
 *         price:
 *           type: number
 *           description: Product price
 *         description:
 *           type: string
 *           description: Product description
 *         available:
 *           type: boolean
 *           description: Product availability
 *         stock:
 *           type: number
 *           description: Available stock quantity
 *         image:
 *           type: string
 *           description: Product image URL
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Product tags
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management endpoints
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items with filtering and pagination
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Items per page
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
 *         name: minPrice
 *         schema: { type: number }
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *         description: Maximum price filter
 *       - in: query
 *         name: available
 *         schema: { type: boolean }
 *         description: Filter by availability
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryItem'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
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
 *                 status: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/InventoryItem'
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
router.get("/categories", inventoryController.getCategories);
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
        path: req.file.path,
        url: req.file.url || `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
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
