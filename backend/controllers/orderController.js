const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res, next) => {
  try {
    const { items, total } = req.body;

    const order = await Order.create({
      userId: req.user._id,
      items,
      total,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Get all orders for the logged-in user
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await orderService.getUserOrders(req.user._id, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
