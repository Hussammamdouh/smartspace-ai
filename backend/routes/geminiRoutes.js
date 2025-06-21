const express = require("express");
const { protect } = require("../middlewares/auth");
const { generateImage } = require("../controllers/geminiImageController");

const router = express.Router();

/**
 * @swagger
 * /api/gemini/generate-image:
 *   post:
 *     summary: Generate image using Google Gemini
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
 *         description: Gemini service error
 */

router.post("/generate-image", protect, generateImage);
module.exports = router;
