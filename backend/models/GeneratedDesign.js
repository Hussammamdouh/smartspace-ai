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
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

GeneratedDesignSchema.index({ user: 1, preference: 1 });

module.exports = mongoose.models.GeneratedDesign || mongoose.model('GeneratedDesign', GeneratedDesignSchema);
