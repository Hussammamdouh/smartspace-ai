const ChatHistory = require('../models/ChatHistory');
const { chatWithGPT, generateImageWithDalle } = require('../services/openaiService');
const { APIError } = require('../middlewares/errorHandler');

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
      success: true,
      data: conversations,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
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
      success: true,
      data: conversation
    });
  } catch (error) {
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

    res.status(201).json({
      success: true,
      data: newConversation
    });
  } catch (error) {
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
      const { imageUrl, designId, prompt, usedItems } = await generateImageWithDalle(
        message,
        req.user.id
      );

      aiResponse = imageUrl;
      responseType = 'image';

      // Add AI response to conversation
      conversation.conversation.push({
        role: 'assistant',
        content: `Generated image based on: ${message}`,
        type: 'image',
        imageUrl,
        designId,
        timestamp: new Date()
      });
    }

    // Update conversation
    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversation: conversation.conversation,
        response: aiResponse,
        type: responseType
      }
    });
  } catch (error) {
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

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
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

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
}; 