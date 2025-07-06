const express = require("express");
const { protect } = require("../middlewares/auth");
const { validate } = require("../middlewares/validateMiddleware");
const { aiPromptSchema } = require("../utils/validationSchemas");
const { generateImage, generateText } = require("../controllers/geminiImageController");

const router = express.Router();

/**
 * @swagger
 * /api/gemini/generate-image:
 *   post:
 *     summary: Generate image using Google Gemini
 *     description: |
 *       Generates images using Google Gemini AI model.
 *       
 *       **Test Cases:**
 *       - ✅ Valid prompt
 *       - ❌ Empty prompt
 *       - ❌ Invalid prompt format
 *       - ❌ Prompt too long (>1000 chars)
 *       - ❌ Unauthorized access
 *     tags: [Phase 6: AI Services]
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

router.post("/generate-image", protect, validate(aiPromptSchema), generateImage);

/**
 * @swagger
 * /api/gemini/generate-text:
 *   post:
 *     summary: Generate text using Google Gemini
 *     description: |
 *       Generates text responses using Google Gemini AI model for interior design advice.
 *       
 *       **Test Cases:**
 *       - ✅ Valid prompt
 *       - ✅ Conversation history
 *       - ❌ Empty prompt and no messages
 *       - ❌ Unauthorized access
 *     tags: [Phase 6: AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt: { type: string }
 *               messages: { 
 *                 type: array,
 *                 items: {
 *                   type: object,
 *                   properties: {
 *                     role: { type: string },
 *                     content: { type: string }
 *                   }
 *                 }
 *               }
 *     responses:
 *       200:
 *         description: Text generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content: { type: string }
 *                 model: { type: string }
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Gemini service error
 */

router.post("/generate-text", protect, generateText);

module.exports = router;
