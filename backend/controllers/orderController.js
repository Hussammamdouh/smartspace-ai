// backend/controllers/orderController.js

const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');
const Cart = require('../models/Cart');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

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
      if (!result) {
        return { success: false, productId: item.productId, error: 'Product not found during stock update' };
      }
      return { success: true, productId: item.productId, newStock: result.stock };
    } catch (error) {
      return { success: false, productId: item.productId, error: error.message };
    }
  });

  return Promise.all(updatePromises);
};

// Create a new order
exports.createOrder = async (req, res, next) => {
  try {
    const { products, total, subtotal, shippingCost, discount, paymentMethod, shippingAddress } = req.body;

    // Defensive checks for required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ status: 'error', message: "No products provided" });
    }
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ status: 'error', message: "Invalid total" });
    }
    if (typeof subtotal !== 'number' || subtotal < 0) {
      return res.status(400).json({ status: 'error', message: "Invalid subtotal" });
    }
    if (!paymentMethod || !['card', 'cash-on-delivery'].includes(paymentMethod)) {
      return res.status(400).json({ status: 'error', message: "Invalid payment method" });
    }

    // Validate stock availability
    const stockValidation = await validateOrderItems(products);
    const invalidItems = stockValidation.filter(item => !item.valid);
    if (invalidItems.length > 0) {
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
      subtotal: subtotal || total,
      shippingCost: shippingCost || 0,
      discount: discount || 0,
      total,
      paymentMethod,
      shippingAddress,
      isPaid: paymentMethod === 'card', // Mark as paid if card payment
      paidAt: paymentMethod === 'card' ? new Date() : null,
    });

    await newOrder.save();

    // Populate order for email
    await newOrder.populate('products.productId');
    await newOrder.populate('userId', 'name email');

    // Clear user's cart after successful order
    try {
      const cart = await Cart.findOne({ userId: req.user._id });
      if (cart) {
        cart.items = [];
        await cart.save();
        logger.info(`Cart cleared for user ${req.user._id} after order ${newOrder._id}`);
      }
    } catch (cartError) {
      logger.error('Failed to clear cart after order:', cartError);
      // Don't fail the order if cart clearing fails
    }

    // Send order confirmation email
    try {
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        const orderEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #A58077;">Order Confirmation</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for your order! Your order has been placed successfully.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> ${newOrder._id}</p>
              <p><strong>Tracking Number:</strong> ${newOrder.trackingNumber || 'Pending'}</p>
              <p><strong>Order Date:</strong> ${new Date(newOrder.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</p>
              <p><strong>Status:</strong> ${newOrder.status}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3>Items Ordered</h3>
              ${products.map(item => `
                <div style="padding: 10px; border-bottom: 1px solid #ddd;">
                  <p style="margin: 5px 0;"><strong>${item.name}</strong> - Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
                </div>
              `).join('')}
            </div>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Subtotal:</strong> $${(subtotal || total).toFixed(2)}</p>
              ${discount > 0 ? `<p><strong>Discount:</strong> -$${discount.toFixed(2)}</p>` : ''}
              ${shippingCost > 0 ? `<p><strong>Shipping:</strong> $${(shippingCost || 0).toFixed(2)}</p>` : '<p><strong>Shipping:</strong> FREE</p>'}
              <p style="font-size: 18px; font-weight: bold; margin-top: 10px;"><strong>Total:</strong> $${total.toFixed(2)}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3>Shipping Address</h3>
              <p>${shippingAddress.name}<br>
              ${shippingAddress.address}<br>
              ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
              ${shippingAddress.country}</p>
            </div>

            <p>You can track your order status in your account dashboard.</p>
            <p>Best regards,<br>The AI Interior Design Team</p>
          </div>
        `;

        await sendEmail(
          user.email,
          'Order Confirmation - AI Interior Design',
          orderEmailHtml
        );
        logger.info(`Order confirmation email sent to ${user.email} for order ${newOrder._id}`);
      }
    } catch (emailError) {
      logger.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({ 
      status: 'success',
      message: "Order placed successfully", 
      data: newOrder 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    next(error);
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

    const order = await Order.findById(id).populate('products.productId').populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ 
        status: 'error',
        message: "Order not found" 
      });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Send status update email if status changed
    if (oldStatus !== status && order.userId && order.userId.email) {
      try {
        const statusMessages = {
          'processing': 'Your order is now being processed',
          'shipped': 'Your order has been shipped!',
          'delivered': 'Your order has been delivered',
          'cancelled': 'Your order has been cancelled'
        };

        const statusEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #A58077;">Order Status Update</h2>
            <p>Hi ${order.userId.name},</p>
            <p>${statusMessages[status] || 'Your order status has been updated'}.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'Pending'}</p>
              <p><strong>Previous Status:</strong> ${oldStatus}</p>
              <p><strong>New Status:</strong> ${status}</p>
            </div>

            <p>You can view your order details in your account dashboard.</p>
            <p>Best regards,<br>The AI Interior Design Team</p>
          </div>
        `;

        await sendEmail(
          order.userId.email,
          `Order Status Update - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          statusEmailHtml
        );
        logger.info(`Status update email sent to ${order.userId.email} for order ${order._id}`);
      } catch (emailError) {
        logger.error('Failed to send status update email:', emailError);
        // Don't fail the status update if email fails
      }
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

// Cancel order (user can cancel pending orders)
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id).populate('products.productId');

    if (!order) {
      return res.status(404).json({ 
        status: 'error',
        message: "Order not found" 
      });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error',
        message: "Not authorized to cancel this order" 
      });
    }

    // Only allow cancellation of pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot cancel order with status: ${order.status}. Only pending or processing orders can be cancelled.`
      });
    }

    // Restore stock levels
    const restoreStockPromises = order.products.map(async (item) => {
      try {
        await InventoryItem.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
        return { success: true, productId: item.productId };
      } catch (error) {
        logger.error(`Failed to restore stock for product ${item.productId}:`, error);
        return { success: false, productId: item.productId, error: error.message };
      }
    });

    await Promise.all(restoreStockPromises);

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Send cancellation email
    try {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        const cancelEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #A58077;">Order Cancelled</h2>
            <p>Hi ${user.name},</p>
            <p>Your order has been cancelled successfully.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
            </div>

            <p>If you paid by card, your refund will be processed within 5-7 business days.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The AI Interior Design Team</p>
          </div>
        `;

        await sendEmail(
          user.email,
          'Order Cancelled - AI Interior Design',
          cancelEmailHtml
        );
        logger.info(`Cancellation email sent to ${user.email} for order ${order._id}`);
      }
    } catch (emailError) {
      logger.error('Failed to send cancellation email:', emailError);
    }

    res.status(200).json({ 
      status: 'success',
      message: "Order cancelled successfully", 
      data: order 
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only) with pagination and filtering
exports.getAllOrders = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }

    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      paymentMethod = '',
      startDate = '',
      endDate = '',
      search = ''
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    
    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('products.productId')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 'success',
      message: 'All orders retrieved successfully',
      data: orders,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
