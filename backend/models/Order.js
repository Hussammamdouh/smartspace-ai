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
    total: {
      type: Number,
      required: true,
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

module.exports = mongoose.model("Order", orderSchema);
