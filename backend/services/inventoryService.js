const InventoryItem = require('../models/inventoryItem');
const paginate = require('../utils/paginate');

exports.getAllItems = async (filters, page = 1, limit = 10) => {
  const queryObj = { isDeleted: false }; // 🔁 filter soft deleted

  if (filters.type) queryObj.type = filters.type;
  if (filters.available !== undefined) queryObj.available = filters.available;
  if (filters.minPrice || filters.maxPrice) {
    queryObj.price = {};
    if (filters.minPrice) queryObj.price.$gte = filters.minPrice;
    if (filters.maxPrice) queryObj.price.$lte = filters.maxPrice;
  }

  const { query, meta } = paginate(InventoryItem.find(queryObj), page, limit);
  const items = await query.exec();
  const totalItems = await InventoryItem.countDocuments(queryObj);
  return {
    data: items,
    meta: {
      ...meta,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

exports.createItem = async (data) => {
  return await InventoryItem.create(data);
};

exports.updateItem = async (id, data) => {
  return await InventoryItem.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteItem = async (id) => {
  return await InventoryItem.findByIdAndUpdate(id, { isDeleted: true });
};
