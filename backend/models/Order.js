const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      }
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    trackingNumber: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash-on-delivery"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      name: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    }
  },
  { timestamps: true }
);

// Generate tracking number before saving
orderSchema.pre('save', async function(next) {
  if (!this.trackingNumber && this.status !== 'cancelled') {
    // Generate unique tracking number: TRK + timestamp + random 6 digits
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    this.trackingNumber = `TRK${timestamp}${random}`;
  }
  next();
});

// Add indexes for better performance
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ trackingNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Order", orderSchema);
