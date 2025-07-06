const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getChatHistory,
  getChatConversation,
  startNewConversation,
  sendMessage,
  sendSimpleMessage,
  deleteConversation,
  updateConversationTitle,
  getUserChats
} = require('../controllers/chatController');

/**
 * @swagger
 * tags:
 *   name: "Phase 5: AI Chat Assistant"
 *   description: Conversational AI, chat history, and design consultation
 */

/**
 * @swagger
 * /api/chat/user-chats:
 *   get:
 *     summary: Get all chat conversations for the logged-in user (dashboard)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user chat conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatHistory'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     summary: Get all chat conversations for the user
 *     tags: [Chat]
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
 *     responses:
 *       200: { description: List of chat conversations }
 */

/**
 * @swagger
 * /api/chat/conversation/{conversationId}:
 *   get:
 *     summary: Get a specific chat conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Chat conversation details }
 */

/**
 * @swagger
 * /api/chat/conversation:
 *   post:
 *     summary: Start a new conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *     responses:
 *       201: { description: New conversation created }
 */

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send a message and get AI response
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - message
 *             properties:
 *               conversationId: { type: string }
 *               message: { type: string }
 *               model: { type: string, enum: [chat, image] }
 *     responses:
 *       200: { description: AI response received }
 */

// Chat history routes
router.get('/user-chats', protect, getUserChats);
router.get('/history', protect, getChatHistory);
router.get('/conversation/:conversationId', protect, getChatConversation);
router.post('/conversation', protect, startNewConversation);
router.post('/message', protect, sendMessage);
router.post('/send', protect, sendSimpleMessage);
router.delete('/conversation/:conversationId', protect, deleteConversation);
router.patch('/conversation/:conversationId/title', protect, updateConversationTitle);

module.exports = router; 