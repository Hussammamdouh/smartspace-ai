const Order = require('../models/Order');
const paginate = require('../utils/paginate');

exports.getUserOrders = async (userId, filters, page = 1, limit = 10) => {
  const queryObj = { userId };

  if (filters.status) queryObj.status = filters.status;
  if (filters.startDate || filters.endDate) {
    queryObj.createdAt = {};
    if (filters.startDate) queryObj.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) queryObj.createdAt.$lte = new Date(filters.endDate);
  }

  const { query, meta } = paginate(Order.find(queryObj), page, limit);
  const orders = await query.populate('items.itemId').exec();
  const totalOrders = await Order.countDocuments(queryObj);

  return {
    data: orders,
    meta: {
      ...meta,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    },
  };
};
