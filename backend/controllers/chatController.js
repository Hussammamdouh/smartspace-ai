const ChatHistory = require('../models/ChatHistory');
const { chatWithGPT, generateImageWithDalle } = require('../services/openaiService');
const { APIError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

// Get user chats for dashboard
exports.getUserChats = async (req, res, next) => {
  try {
    const conversations = await ChatHistory.find({ 
      user: req.user.id, 
      isActive: true 
    })
    .sort({ updatedAt: -1 })
    .limit(10) // Limit to recent 10 conversations for dashboard
    .select('title createdAt updatedAt conversation');
    
    res.status(200).json({
      status: 'success',
      data: conversations
    });
  } catch (error) {
    logger.error('Error getting user chats:', error);
    next(error);
  }
};

// Get all chat conversations for a user
exports.getChatHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const conversations = await ChatHistory.find({ 
      user: req.user.id, 
      isActive: true 
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select('title createdAt updatedAt conversation');

    const total = await ChatHistory.countDocuments({ 
      user: req.user.id, 
      isActive: true 
    });

    res.status(200).json({
      status: 'success',
      data: conversations,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting chat history:', error);
    next(error);
  }
};

// Get a specific chat conversation
exports.getChatConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await ChatHistory.findOne({
      _id: conversationId,
      user: req.user.id,
      isActive: true
    }).populate('conversation.designId');

    if (!conversation) {
      return next(new APIError('Conversation not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: conversation
    });
  } catch (error) {
    logger.error('Error getting chat conversation:', error);
    next(error);
  }
};

// Start a new conversation
exports.startNewConversation = async (req, res, next) => {
  try {
    const { title = 'New Conversation' } = req.body;

    const newConversation = await ChatHistory.create({
      user: req.user.id,
      title,
      conversation: []
    });

    logger.info(`New conversation created: ${newConversation._id}`);

    res.status(201).json({
      status: 'success',
      data: newConversation
    });
  } catch (error) {
    logger.error('Error starting new conversation:', error);
    next(error);
  }
};

// Send a message and get AI response
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, message, model = 'chat' } = req.body;

    if (!message || !conversationId) {
      return next(new APIError('Message and conversation ID are required', 400));
    }

    // Find the conversation
    let conversation = await ChatHistory.findOne({
      _id: conversationId,
      user: req.user.id,
      isActive: true
    });

    if (!conversation) {
      return next(new APIError('Conversation not found', 404));
    }

    // Add user message to conversation
    conversation.conversation.push({
      role: 'user',
      content: message,
      type: 'text',
      timestamp: new Date()
    });

    let aiResponse;
    let responseType = 'text';
    let designData = null;

    if (model === 'chat') {
      // Get AI text response
      const messages = conversation.conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      aiResponse = await chatWithGPT(messages);
      
      // Add AI response to conversation
      conversation.conversation.push({
        role: 'assistant',
        content: aiResponse,
        type: 'text',
        timestamp: new Date()
      });

    } else if (model === 'image') {
      // Generate image
      logger.info(`Starting image generation for user ${req.user.id}: ${message.substring(0, 100)}...`);
      const startTime = Date.now();
      
      const { imageUrl, designId, prompt, usedItems, totalCost, furnitureCount, metadata } = await generateImageWithDalle(
        message,
        req.user.id
      );
      
      const endTime = Date.now();
      logger.info(`Image generation completed in ${endTime - startTime}ms for user ${req.user.id}`);

      aiResponse = imageUrl;
      responseType = 'image';
      designData = {
        designId,
        totalCost,
        furnitureCount,
        usedItems: usedItems.map(item => ({
          id: item._id,
          name: item.name,
          category: item.category,
          price: item.price
        })),
        metadata
      };

      // Add AI response to conversation
      conversation.conversation.push({
        role: 'assistant',
        content: `Generated interior design image based on: ${message}`,
        type: 'image',
        imageUrl,
        designId,
        timestamp: new Date(),
        designData: {
          designId,
          totalCost,
          furnitureCount,
          usedItems: usedItems.map(item => ({
            id: item._id,
            name: item.name,
            category: item.category,
            price: item.price
          })),
          metadata: {
            roomType: metadata?.roomType,
            style: metadata?.style,
            colorScheme: metadata?.colorScheme
          }
        },
        metadata: {
          totalCost,
          furnitureCount,
          usedItems: usedItems.map(item => ({
            id: item._id,
            name: item.name,
            category: item.category,
            price: item.price
          }))
        }
      });
    }

    // Update conversation
    conversation.updatedAt = new Date();
    await conversation.save();

    logger.info(`Message sent in conversation ${conversationId}, response type: ${responseType}`);
    logger.info(`Design data being sent: ${JSON.stringify(designData)}`);

    res.status(200).json({
      status: 'success',
      data: {
        conversation: conversation.conversation,
        response: aiResponse,
        type: responseType,
        designData
      }
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    next(error);
  }
};

// Simple chat endpoint for mobile app
exports.sendSimpleMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return next(new APIError('Message is required', 400));
    }

    // Get AI response using OpenAI service
    const aiResponse = await chatWithGPT([
      { role: 'user', content: message }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        message: aiResponse,
        content: aiResponse
      }
    });
  } catch (error) {
    logger.error('Error sending simple message:', error);
    next(error);
  }
};

// Delete a conversation
exports.deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await ChatHistory.findOneAndUpdate(
      {
        _id: conversationId,
        user: req.user.id
      },
      { isActive: false },
      { new: true }
    );

    if (!conversation) {
      return next(new APIError('Conversation not found', 404));
    }

    logger.info(`Conversation deleted: ${conversationId}`);

    res.status(200).json({
      status: 'success',
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting conversation:', error);
    next(error);
  }
};

// Update conversation title
exports.updateConversationTitle = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;

    if (!title) {
      return next(new APIError('Title is required', 400));
    }

    const conversation = await ChatHistory.findOneAndUpdate(
      {
        _id: conversationId,
        user: req.user.id,
        isActive: true
      },
      { title },
      { new: true }
    );

    if (!conversation) {
      return next(new APIError('Conversation not found', 404));
    }

    logger.info(`Conversation title updated: ${conversationId} -> ${title}`);

    res.status(200).json({
      status: 'success',
      data: conversation
    });
  } catch (error) {
    logger.error('Error updating conversation title:', error);
    next(error);
  }
}; 