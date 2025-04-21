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

module.exports = mongoose.model("DesignPreference", designPreferenceSchema);
