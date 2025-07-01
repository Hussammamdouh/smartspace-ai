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
  additionalNotes: {
    type: String,
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

module.exports = mongoose.model("DesignPreference", designPreferenceSchema);
