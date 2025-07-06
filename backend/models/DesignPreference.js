const mongoose = require("mongoose");

const designPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomType: {
    type: String,
    required: true,
  },
  style: {
    type: String,
    required: true,
  },
  colorPalette: {
    type: [String],
    default: [],
  },
  dimensions: {
    type: String,
  },
  budget: {
    type: Number,
  },
  // Cost estimation fields
  estimatedCost: {
    type: Number,
    default: 0,
  },
  furnitureCount: {
    type: Number,
    default: 0,
  },
  costRange: {
    min: Number,
    max: Number,
  },
  // Enhanced preferences
  additionalNotes: {
    type: String,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  timeline: {
    type: String,
    enum: ['immediate', '1-3 months', '3-6 months', '6+ months'],
    default: '1-3 months',
  },
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0,
  },
  lastUsed: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Add indexes for better performance
designPreferenceSchema.index({ user: 1 });
designPreferenceSchema.index({ roomType: 1 });
designPreferenceSchema.index({ style: 1 });
designPreferenceSchema.index({ user: 1, createdAt: -1 });
designPreferenceSchema.index({ estimatedCost: 1 });
designPreferenceSchema.index({ budget: 1 });
designPreferenceSchema.index({ isActive: 1 });

// Virtual for budget utilization
designPreferenceSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget || this.budget === 0) return 0;
  return (this.estimatedCost / this.budget) * 100;
});

// Method to update usage
designPreferenceSchema.methods.updateUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  await this.save();
};

// Method to check if within budget
designPreferenceSchema.methods.isWithinBudget = function() {
  if (!this.budget) return true;
  return this.estimatedCost <= this.budget;
};

// Pre-save middleware to set cost range
designPreferenceSchema.pre('save', function(next) {
  if (this.estimatedCost && !this.costRange) {
    const margin = 0.2; // 20% margin
    this.costRange = {
      min: Math.floor(this.estimatedCost * (1 - margin)),
      max: Math.ceil(this.estimatedCost * (1 + margin))
    };
  }
  next();
});

module.exports = mongoose.model("DesignPreference", designPreferenceSchema);
