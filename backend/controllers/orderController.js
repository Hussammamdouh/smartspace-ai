// backend/controllers/orderController.js

const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res, next) => {
  try {
    const { products, total, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }

    const newOrder = new Order({
      userId: req.user._id,
      products,
      total,
      paymentMethod,
    });

    await newOrder.save();

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    next(error);
  }
};

// Get all orders for the logged-in user
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};
