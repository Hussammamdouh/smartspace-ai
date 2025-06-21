/**
 * @swagger
 * /api/design/preferences:
 *   post:
 *     summary: Save user design preferences (chatbot result)
 *     tags: [Designs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomType
 *               - style
 *             properties:
 *               roomType: { type: string, example: Living Room }
 *               style: { type: string, example: Modern }
 *               colorPalette: { type: array, items: { type: string }, example: [gray, white, blue] }
 *               budget: { type: number, example: 2000 }
 *               dimensions: { type: string, example: 5x7 meters }
 *               additionalNotes: { type: string, example: Include a large sofa and TV }
 *     responses:
 *       201: { description: Preferences saved successfully }
 */

/**
 * @swagger
 * /api/design/generate:
 *   post:
 *     summary: Generate AI room design based on saved preferences
 *     tags: [Designs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preferenceId
 *             properties:
 *               preferenceId: { type: string, example: 6612f3e9a90d6a4f0c80bd9d }
 *     responses:
 *       201: { description: AI-generated design returned }
 */

/**
 * @swagger
 * /api/design/generated:
 *   get:
 *     summary: Get all AI-generated designs for logged-in user
 *     tags: [Designs]
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
 *         name: style
 *         schema: { type: string }
 *         description: Filter by design style
 *       - in: query
 *         name: roomType
 *         schema: { type: string }
 *         description: Filter by room type
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Filter from date
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Filter to date
 *     responses:
 *       200: { description: List of generated designs }
 */

const express = require('express');
const router = express.Router();
const designController = require('../controllers/designController');
const { protect, authorize } = require('../middlewares/auth');
const {validate} = require('../middlewares/validateMiddleware');
const { designSchema } = require('../utils/validationSchemas');

router.get('/', protect, designController.getDesigns);
router.post('/', protect, validate(designSchema), designController.createDesign);
router.delete('/:id', protect, designController.deleteDesign);

// 🔥 AI Design Routes
router.post('/preferences', protect, designController.savePreferences);
router.post('/generate', protect, designController.generateDesign);
router.get('/generated', protect, designController.getGeneratedDesigns);

module.exports = router;
