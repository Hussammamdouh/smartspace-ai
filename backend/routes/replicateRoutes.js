const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const { generateImage } = require("../controllers/replicateImageController");

/**
 * @swagger
 * /api/replicate/generate:
 *   post:
 *     summary: Generate image using Replicate AI
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt: { type: string }
 *               conversationId: { type: string }
 *               model: { type: string, default: 'stability-ai/sdxl' }
 *     responses:
 *       200:
 *         description: Image generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl: { type: string }
 *                 designId: { type: string }
 *                 prompt: { type: string }
 *       400:
 *         description: Invalid prompt
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Replicate service error
 */

router.post("/generate", protect, generateImage);
module.exports = router;
