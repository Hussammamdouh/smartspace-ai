const mongoose = require('mongoose');

const InventoryItemSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { 
      type: String, 
      enum: [
        // Room categories
        "bedroom", "child bedroom", "kitchen", "bathroom", "living room",
        // Furniture categories
        "sofa", "coffee table", "armchair", "tv stand", "bookshelf", "lamp", "rug",
        "bed", "nightstand", "dresser", "mirror",
        "kitchen cabinet", "refrigerator", "stove", "sink", "dining table", "chair",
        "toilet", "bathtub", "shower", "towel rack"
      ] 
    },
    style: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    description: { type: String },
    available: { type: Boolean, default: true },
    stock: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    image: { type: String },
    public_id: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

InventoryItemSchema.index({ category: 1, available: 1 });
InventoryItemSchema.index({ style: 1 });
InventoryItemSchema.index({ color: 1 });
InventoryItemSchema.index({ price: 1 });
InventoryItemSchema.index({ isDeleted: 1 });
InventoryItemSchema.index({ available: 1, isDeleted: 1 });
InventoryItemSchema.index({ category: 1, style: 1, available: 1 });

module.exports = mongoose.models.InventoryItem || mongoose.model("InventoryItem", InventoryItemSchema);
