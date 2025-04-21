const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
