const inventoryService = require("../services/inventoryService");
const InventoryItem = require('../models/InventoryItem');
const mongoose = require("mongoose");
const { APIError } = require('../middlewares/errorHandler');

exports.getInventory = async (req, res) => {
  try {
    const { category, style, color, maxPrice = 5000, page = 1, limit = 9, ids } = req.query;

    const filter = {
      isDeleted: false,
      available: true,
      price: { $lte: Number(maxPrice) },
    };

    if (category) filter.category = category.toLowerCase();
    if (style) filter.style = style.toLowerCase();
    if (color) filter.color = color.toLowerCase();
    
    // Support for fetching by IDs (for wishlist)
    if (ids) {
      const idArray = ids.split(',').map(id => id.trim());
      const validIds = idArray.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length > 0) {
        filter._id = { $in: validIds };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      InventoryItem.find(filter).skip(skip).limit(Number(limit)),
      InventoryItem.countDocuments(filter),
    ]);

    res.status(200).json({
      data: items,
      meta: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new APIError("Invalid product ID", 400));
    }

    const item = await InventoryItem.findById(id);
    if (!item) {
      return next(new APIError("Product not found", 404));
    }

    res.status(200).json({ data: item });
  } catch (error) {
    next(error);
  }
};

exports.addInventoryItem = async (req, res, next) => {
  try {
    const { name, type, price, stock } = req.body;
    const filePath = req.file ? req.file.path : null;

    if (!name || !type || !price || !stock || !filePath) {
      return next(new APIError("Missing required fields", 400));
    }

    const item = await inventoryService.createItem({
      name,
      type,
      price,
      stock,
      filePath,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.updateInventoryItem = async (req, res, next) => {
  try {
    const updates = {
      ...req.body,
    };
    if (req.file) {
      updates.filePath = req.file.path;
    }
    const updatedItem = await inventoryService.updateItem(req.params.id, updates);
    if (!updatedItem) {
      return next(new APIError("Product not found or update failed", 404));
    }
    res.status(200).json({ message: "Product updated successfully", data: updatedItem });
  } catch (error) {
    next(error);
  }
};

exports.deleteInventoryItem = async (req, res, next) => {
  try {
    await inventoryService.deleteItem(req.params.id);
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    next(error);
  }
};
