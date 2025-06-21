const mongoose = require('mongoose');

const GeneratedDesignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  preference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignPreference',
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
  }],
  modelUsed: {
    type: String,
    default: 'DALL·E 3',
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'success',
  },
  // Edit history support
  originalDesign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedDesign',
  },
  editHistory: [{
    action: {
      type: String,
      enum: ['add', 'remove', 'modify'],
    },
    furnitureItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    }],
    prompt: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  editPreferences: {
    furniturePreferences: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    }],
    stylePreferences: {
      type: Object,
    },
    colorPreferences: {
      type: Object,
    },
    notes: String,
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

GeneratedDesignSchema.index({ user: 1, preference: 1 });
GeneratedDesignSchema.index({ user: 1, originalDesign: 1 });
GeneratedDesignSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.GeneratedDesign || mongoose.model('GeneratedDesign', GeneratedDesignSchema);
