const inventoryService = require("../services/inventoryService");
const InventoryItem = require('../models/InventoryItem');
const mongoose = require("mongoose");

exports.getInventory = async (req, res) => {
  try {
    const { category, style, color, maxPrice = 5000, page = 1, limit = 9 } = req.query;

    const filter = {
      isDeleted: false,
      available: true,
      price: { $lte: Number(maxPrice) },
    };

    if (category) filter.category = category.toLowerCase();
    if (style) filter.style = style.toLowerCase();
    if (color) filter.color = color.toLowerCase();

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
    console.error("Inventory fetch error:", error);
    res.status(500).json({ message: "Failed to load products" });
  }
};

exports.getInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Product not found" });
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
      return res.status(400).json({ message: "Missing required fields" });
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
      return res.status(404).json({ message: "Product not found or update failed" });
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
