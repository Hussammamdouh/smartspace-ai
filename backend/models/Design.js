const mongoose = require('mongoose');

const designSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomType: { type: String, required: true },
    style: { type: String, required: true },
    measurements: { type: Object, required: true },
    notes: { type: String },
    designFile: { type: String }, // Path to a saved file if needed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Design', designSchema);
