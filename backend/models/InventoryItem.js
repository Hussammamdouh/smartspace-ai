const mongoose = require('mongoose');

const InventoryItemSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    modelPath: { type: String, required: true },
    filePath: { type: String },
    description: { type: String },
    available: { type: Boolean, default: true },
    stock: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ type: 1, available: 1 });

module.exports = mongoose.models.InventoryItem || mongoose.model("InventoryItem", InventoryItemSchema);
