const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversation: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'image'],
      default: 'text'
    },
    imageUrl: String,
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GeneratedDesign'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  title: {
    type: String,
    default: 'New Conversation'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatHistorySchema.index({ user: 1, createdAt: -1 });
chatHistorySchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema); 