const mongoose = require('mongoose');

const InventoryItemSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["bedroom", "child bedroom", "kitchen", "bathroom", "living room"] 
    },
    style: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    description: { type: String },
    available: { type: Boolean, default: true },
    stock: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    image: { type: String },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ category: 1, available: 1 });

module.exports = mongoose.models.InventoryItem || mongoose.model("InventoryItem", InventoryItemSchema);
