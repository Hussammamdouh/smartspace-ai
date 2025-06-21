const express = require('express');
const { protect } = require("../middlewares/auth");
const { handleUnifiedChat } = require("../controllers/openaiController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI Services
 *   description: AI-powered services (OpenAI, Gemini, Replicate)
 */

/**
 * @swagger
 * /api/chatbot/unified:
 *   post:
 *     summary: Generate AI response using OpenAI (unified chat)
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
 *               - messages
 *               - model
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant] }
 *                     content: { type: string }
 *               model: { type: string, enum: [chat, image] }
 *     responses:
 *       200:
 *         description: AI response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role: { type: string }
 *                 type: { type: string, enum: [text, image] }
 *                 content: { type: string }
 *                 designId: { type: string }
 *                 prompt: { type: string }
 *                 usedItems: { type: array, items: { type: string } }
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI service error
 */

router.post("/unified", protect, handleUnifiedChat);
module.exports = router;
