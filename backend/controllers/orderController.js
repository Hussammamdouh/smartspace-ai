// backend/controllers/orderController.js

const Order = require('../models/Order');

// Get user orders for dashboard
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId')
      .sort({ createdAt: -1 })
      .limit(10); // Limit to recent 10 orders for dashboard
    
    res.status(200).json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Create a new order
exports.createOrder = async (req, res, next) => {
  try {
    const { products, total, paymentMethod, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }

    const newOrder = new Order({
      userId: req.user._id,
      products,
      total,
      paymentMethod,
      shippingAddress,
      isPaid: paymentMethod === 'card', // Mark as paid if card payment
      paidAt: paymentMethod === 'card' ? new Date() : null,
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
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId')
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('products.productId')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order or is admin
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({ data: order });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to update orders" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('products.productId');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    next(error);
  }
};
