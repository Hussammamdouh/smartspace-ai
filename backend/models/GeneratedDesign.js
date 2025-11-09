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
  public_id: {
    type: String,
    required: false,
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
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
    default: 'pending',
  },
  generationProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0,
  },
  apiCost: {
    type: Number,
    default: 0,
  },
  // Cost estimation data
  totalCost: {
    type: Number,
    default: 0,
  },
  furnitureCount: {
    type: Number,
    default: 0,
  },
  // Enhanced metadata
  metadata: {
    totalCost: Number,
    furnitureCount: Number,
    roomType: String,
    style: String,
    colorScheme: String,
    originalPrompt: String,
    enhancedPrompt: String,
    generationTime: {
      type: Date,
      default: Date.now,
    },
    imageQuality: {
      type: String,
      enum: ['standard', 'hd'],
      default: 'standard',
    },
    imageSize: {
      type: String,
      default: '1024x1024',
    },
    promptHash: String, // For caching duplicate prompts
    generationDuration: Number, // in milliseconds
    apiProvider: {
      type: String,
      default: 'openai',
    },
    modelVersion: String,
  },
  // Version control for edits
  versions: [{
    versionNumber: Number,
    imageUrl: String,
    public_id: String,
    editDescription: String,
    createdAt: Date,
    metadata: mongoose.Schema.Types.Mixed
  }],
  currentVersion: {
    type: Number,
    default: 1,
  },
  // Edit history support
  originalDesign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedDesign',
  },
  editHistory: [{
    action: {
      type: String,
      enum: ['add', 'remove', 'modify', 'custom_prompt', 'custom-prompt'],
    },
    furnitureItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    }],
    prompt: String,
    costChange: Number,
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
  // Usage tracking
  views: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Indexes for better performance
GeneratedDesignSchema.index({ user: 1, preference: 1 });
GeneratedDesignSchema.index({ user: 1, originalDesign: 1 });
GeneratedDesignSchema.index({ user: 1, createdAt: -1 });
GeneratedDesignSchema.index({ totalCost: 1 });
GeneratedDesignSchema.index({ roomType: 1, style: 1 });
GeneratedDesignSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for cost per item
GeneratedDesignSchema.virtual('costPerItem').get(function() {
  return this.furnitureCount > 0 ? this.totalCost / this.furnitureCount : 0;
});

// Method to update cost
GeneratedDesignSchema.methods.updateCost = async function() {
  if (this.relatedProducts && this.relatedProducts.length > 0) {
    const InventoryItem = mongoose.model('InventoryItem');
    const items = await InventoryItem.find({ _id: { $in: this.relatedProducts } });
    this.totalCost = items.reduce((sum, item) => sum + (item.price || 0), 0);
    this.furnitureCount = items.length;
    await this.save();
  }
};

// Method to add view
GeneratedDesignSchema.methods.addView = async function() {
  this.views += 1;
  await this.save();
};

// Method to add download
GeneratedDesignSchema.methods.addDownload = async function() {
  this.downloads += 1;
  await this.save();
};

// Pre-save middleware to ensure metadata is set
GeneratedDesignSchema.pre('save', function(next) {
  if (this.isNew && !this.metadata.generationTime) {
    this.metadata.generationTime = new Date();
  }
  next();
});

module.exports = mongoose.models.GeneratedDesign || mongoose.model('GeneratedDesign', GeneratedDesignSchema);
