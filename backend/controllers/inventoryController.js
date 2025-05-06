const inventoryService = require("../services/inventoryService");
const InventoryItem = require('../models/inventoryItem');
const mongoose = require("mongoose");

exports.getInventory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, minPrice, maxPrice, available } = req.query;

    const filters = {
      type,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      available: available !== undefined ? available === "true" : undefined,
    };

    const result = await inventoryService.getAllItems(filters, page, limit);

    res.status(200).json(result);
  } catch (error) {
    next(error);
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
    const filePath = req.file ? req.file.path : product.filePath;

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
