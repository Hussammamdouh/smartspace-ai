const express = require('express');
const router = express.Router();
const { protect, editDesignLimiter } = require('../middlewares/auth');
const {
  getDesignForEdit,
  getAvailableFurniture,
  editDesign,
  editDesignWithCustomPrompt,
  getDesignEditHistory,
  getDesignVersion,
  restoreDesignVersion,
  saveEditPreferences,
  exportDesign
} = require('../controllers/editDesignController');

/**
 * @swagger
 * tags:
 *   name: Edit Design
 *   description: Enhanced design editing functionality
 */

/**
 * @swagger
 * /api/edit-design/{designId}:
 *   get:
 *     summary: Get design for editing
 *     tags: [Edit Design]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Design details for editing }
 */

/**
 * @swagger
 * /api/edit-design/furniture:
 *   get:
 *     summary: Get available furniture items for editing
 *     tags: [Edit Design]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: style
 *         schema: { type: string }
 *       - in: query
 *         name: color
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Available furniture items }
 */

/**
 * @swagger
 * /api/edit-design/{designId}/edit:
 *   post:
 *     summary: Edit design by adding/removing furniture
 *     tags: [Edit Design]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - furnitureItems
 *             properties:
 *               action: { type: string, enum: [add, remove] }
 *               furnitureItems: { type: array, items: { type: string } }
 *               prompt: { type: string }
 *               originalImageUrl: { type: string }
 *     responses:
 *       201: { description: Design edited successfully }
 */

/**
 * @swagger
 * /api/edit-design/{designId}/custom-prompt:
 *   post:
 *     summary: Edit design using custom prompt (preserves background)
 *     tags: [Edit Design]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt: { type: string, description: Custom prompt for editing }
 *               originalImageUrl: { type: string }
 *     responses:
 *       200: { description: Design edited successfully with custom prompt }
 */

/**
 * @swagger
 * /api/edit-design/{designId}/history:
 *   get:
 *     summary: Get design edit history
 *     tags: [Edit Design]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Design edit history }
 */

/**
 * @swagger
 * /api/edit-design/{designId}/preferences:
 *   post:
 *     summary: Save design edit preferences
 *     tags: [Edit Design]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               furniturePreferences: { type: array, items: { type: string } }
 *               stylePreferences: { type: object }
 *               colorPreferences: { type: object }
 *               notes: { type: string }
 *     responses:
 *       200: { description: Preferences saved successfully }
 */

/**
 * @swagger
 * /api/edit-design/{designId}/export:
 *   get:
 *     summary: Export design as final version
 *     tags: [Edit Design]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: format
 *         schema: { type: string, default: image }
 *     responses:
 *       200: { description: Design exported successfully }
 */

// Edit design routes
router.get('/:designId', protect, getDesignForEdit);
router.get('/furniture', protect, getAvailableFurniture);
router.post('/:designId/edit', protect, editDesignLimiter, editDesign);
router.post('/:designId/custom-prompt', protect, editDesignLimiter, editDesignWithCustomPrompt);
router.get('/:designId/history', protect, getDesignEditHistory);
router.get('/:designId/version/:versionNumber', protect, getDesignVersion);
router.post('/:designId/restore/:versionNumber', protect, restoreDesignVersion);
router.post('/:designId/preferences', protect, saveEditPreferences);
router.get('/:designId/export', protect, exportDesign);

module.exports = router; 