const inventoryService = require("../services/inventoryService");
const InventoryItem = require('../models/InventoryItem');
const mongoose = require("mongoose");
const { APIError } = require('../middlewares/errorHandler');
const { deleteFromCloudinary } = require('../config/cloudinary');

exports.getInventory = async (req, res, next) => {
  try {
    const { category, style, color, maxPrice = 5000, page = 1, limit = 9, ids, search } = req.query;

    const filter = {
      isDeleted: false,
      available: true,
      price: { $lte: Number(maxPrice) },
    };

    if (category) filter.category = category.toLowerCase();
    if (style) filter.style = style.toLowerCase();
    if (color) filter.color = color.toLowerCase();
    
    // Support for searching by name, description, or tags
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { tags: regex }
      ];
    }
    
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
      status: 'success',
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

    res.status(200).json({ 
      status: 'success',
      data: item 
    });
  } catch (error) {
    next(error);
  }
};

exports.addInventoryItem = async (req, res, next) => {
  try {
    const { name, category, price, stock, style, color, description, tags, available } = req.body;
    const filePath = req.file ? req.file.path : null;

    if (!name || !category || !price || stock === undefined || !filePath) {
      return next(new APIError("Missing required fields", 400));
    }

    // Parse tags if they come as JSON string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = [];
      }
    }

    const itemData = {
      name,
      category: category.toLowerCase(),
      price: Number(price),
      stock: Number(stock),
      available: available !== 'false',
      image: req.file && req.file.url ? req.file.url : filePath,
      public_id: req.file && req.file.public_id ? req.file.public_id : undefined
    };

    // Add optional fields if provided
    if (style) itemData.style = style;
    if (color) itemData.color = color;
    if (description) itemData.description = description;
    if (parsedTags.length > 0) itemData.tags = parsedTags;

    const item = await inventoryService.createItem(itemData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: item
    });
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
      // Delete old image from Cloudinary if present
      const item = await InventoryItem.findById(req.params.id);
      if (item && item.public_id) {
        await deleteFromCloudinary(item.public_id);
      }
      updates.filePath = req.file.path;
      updates.image = req.file.url ? req.file.url : req.file.path;
      updates.public_id = req.file.public_id;
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
    const item = await InventoryItem.findById(req.params.id);
    if (item && item.public_id) {
      await deleteFromCloudinary(item.public_id);
    }
    await inventoryService.deleteItem(req.params.id);
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    next(error);
  }
};

// Get all available categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = [
      { _id: 'bedroom', name: 'Bedroom' },
      { _id: 'child-bedroom', name: 'Child Bedroom' },
      { _id: 'kitchen', name: 'Kitchen' },
      { _id: 'bathroom', name: 'Bathroom' },
      { _id: 'living-room', name: 'Living Room' },
    ];

    res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
