// backend/controllers/orderController.js

const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');
const mongoose = require('mongoose');

// Get user orders for dashboard
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId')
      .sort({ createdAt: -1 })
      .limit(10); // Limit to recent 10 orders for dashboard
    
    res.status(200).json({
      status: 'success',
      message: 'User orders retrieved successfully',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Validate stock availability for order items
const validateOrderItems = async (products) => {
  const validationResults = [];
  
  for (const item of products) {
    try {
      const product = await InventoryItem.findById(item.productId);
      if (!product) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          error: 'Product not found'
        });
        continue;
      }

      if (product.stock < item.quantity) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          error: `Insufficient stock. Available: ${product.stock}, Requested: ${item.quantity}`,
          availableStock: product.stock
        });
        continue;
      }

      validationResults.push({
        productId: item.productId,
        valid: true,
        currentPrice: product.price
      });
    } catch (error) {
      validationResults.push({
        productId: item.productId,
        valid: false,
        error: 'Error validating product'
      });
    }
  }

  return validationResults;
};

// Update stock levels for order items
const updateStockLevels = async (products) => {
  const updatePromises = products.map(async (item) => {
    try {
      const result = await InventoryItem.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      return { success: true, productId: item.productId, newStock: result.stock };
    } catch (error) {
      return { success: false, productId: item.productId, error: error.message };
    }
  });

  return Promise.all(updatePromises);
};

// Create a new order
exports.createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { products, total, paymentMethod, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ 
        status: 'error',
        message: "No products provided" 
      });
    }

    // Validate stock availability
    const stockValidation = await validateOrderItems(products);
    const invalidItems = stockValidation.filter(item => !item.valid);
    
    if (invalidItems.length > 0) {
      await session.abortTransaction();
      return res.status(422).json({
        status: 'error',
        message: 'Some items are not available in the requested quantity',
        invalidItems
      });
    }

    // Update stock levels
    const stockUpdates = await updateStockLevels(products);
    const failedUpdates = stockUpdates.filter(update => !update.success);
    
    if (failedUpdates.length > 0) {
      await session.abortTransaction();
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update stock levels',
        failedUpdates
      });
    }

    // Create the order
    const newOrder = new Order({
      userId: req.user._id,
      products,
      total,
      paymentMethod,
      shippingAddress,
      isPaid: paymentMethod === 'card', // Mark as paid if card payment
      paidAt: paymentMethod === 'card' ? new Date() : null,
    });

    await newOrder.save({ session });

    await session.commitTransaction();

    res.status(201).json({ 
      status: 'success',
      message: "Order placed successfully", 
      data: newOrder 
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Get all orders for the logged-in user
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId')
      .sort({ createdAt: -1 });
    res.status(200).json({ 
      status: 'success',
      message: 'Orders retrieved successfully',
      data: orders 
    });
  } catch (error) {
    next(error);
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id)
      .populate('products.productId')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ 
        status: 'error',
        message: "Order not found" 
      });
    }

    // Check if user owns this order or is admin
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error',
        message: "Not authorized to view this order" 
      });
    }

    res.status(200).json({ 
      status: 'success',
      message: 'Order retrieved successfully',
      data: order 
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order ID'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error',
        message: "Not authorized to update orders" 
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('products.productId');

    if (!order) {
      return res.status(404).json({ 
        status: 'error',
        message: "Order not found" 
      });
    }

    res.status(200).json({ 
      status: 'success',
      message: "Order status updated", 
      data: order 
    });
  } catch (error) {
    next(error);
  }
};
