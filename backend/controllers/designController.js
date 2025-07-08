const designService = require('../services/designService');
const DesignPreference = require('../models/DesignPreference');
const GeneratedDesign = require('../models/GeneratedDesign');
const Design = require('../models/Design');
const InventoryItem = require('../models/InventoryItem');
const { APIError } = require('../middlewares/errorHandler');
const fetch = require('node-fetch');
const { deleteFromCloudinary } = require('../config/cloudinary');

// Get user designs for dashboard
exports.getUserDesigns = async (req, res, next) => {
  try {
    const designs = await GeneratedDesign.find({ user: req.user.id })
      .populate('preference')
      .populate('relatedProducts')
      .sort({ createdAt: -1 })
      .limit(10); // Limit to recent 10 designs for dashboard
    
    res.status(200).json({
      status: 'success',
      data: designs
    });
  } catch (error) {
    next(error);
  }
};

exports.getDesigns = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await designService.getUserDesigns(req.user.id, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getDesign = async (req, res, next) => {
  try {
    const design = await GeneratedDesign.findById(req.params.id)
      .populate('preference')
      .populate('relatedProducts');
    
    if (!design) {
      return next(new APIError('Design not found', 404));
    }
    
    if (design.user.toString() !== req.user.id.toString()) {
      return next(new APIError('Unauthorized to access this design', 403));
    }
    
    res.status(200).json({ design });
  } catch (error) {
    next(error);
  }
};

exports.createDesign = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      user: req.user.id,
    };
    const design = await designService.createDesign(data);
    res.status(201).json(design);
  } catch (error) {
    next(error);
  }
};

exports.deleteDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design || design.userId.toString() !== req.user.id.toString()) {
      return next(new APIError('Unauthorized to delete this design', 403));
    }
    // Delete image from Cloudinary if public_id exists
    if (design.public_id) {
      await deleteFromCloudinary(design.public_id);
    }
    await Design.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Design deleted' });
  } catch (error) {
    next(error);
  }
};

exports.savePreferences = async (req, res, next) => {
  try {
    const { roomType, style, colorPalette, budget, dimensions, additionalNotes } = req.body;

    const preference = await DesignPreference.create({
      user: req.user.id,
      roomType,
      style,
      colorPalette,
      budget,
      dimensions,
      additionalNotes,
    });

    res.status(201).json({ success: true, preference });
  } catch (err) {
    next(err);
  }
};

exports.generateDesign = async (req, res, next) => {
  try {
    const { preferenceId } = req.body;
    const design = await designService.generateImageDesign(preferenceId, req.user.id);
    res.status(201).json({ success: true, design });
  } catch (err) {
    next(err);
  }
};

// Simple design generation for mobile app
exports.generateSimpleDesign = async (req, res, next) => {
  try {
    const { roomType, style, description } = req.body;

    if (!roomType || !style || !description) {
      return next(new APIError('Room type, style, and description are required', 400));
    }

    // Create a simple design preference
    const preference = await DesignPreference.create({
      user: req.user.id,
      roomType,
      style,
      additionalNotes: description,
    });

    // Generate design using the service
    const design = await designService.generateImageDesign(preference._id, req.user.id);

    res.status(201).json({
      status: 'success',
      data: {
        designId: design._id,
        imageUrl: design.imageUrl || 'https://example.com/generated-image.jpg',
        style,
        roomType,
        description
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getGeneratedDesigns = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, style, roomType, startDate, endDate } = req.query;

    const query = { user: userId };

    if (style) query['preference.style'] = style;
    if (roomType) query['preference.roomType'] = roomType;

    const preferenceMatch = {};
    if (style) preferenceMatch.style = style;
    if (roomType) preferenceMatch.roomType = roomType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await GeneratedDesign.countDocuments(query);
    const designs = await GeneratedDesign.find(query)
      .populate({
        path: 'preference',
        match: preferenceMatch,
      })
      .populate('relatedProducts')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const filteredDesigns = designs.filter(d => d.preference); // Remove null preferences

    res.status(200).json({
      success: true,
      data: filteredDesigns,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: filteredDesigns.length,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Extract furniture items from a design for purchase
exports.extractItems = async (req, res, next) => {
  try {
    const { imageUrl, prompt } = req.body;
    
    console.log('Extract items request:', { imageUrl, prompt });
    
    if (!imageUrl) {
      return next(new APIError('Image URL is required', 400));
    }

    // Extract context from the prompt to find relevant items
    const context = {
      category: 'living room', // Default
      style: 'modern', // Default
      color: null
    };

    // Simple keyword extraction from prompt
    if (prompt) {
      const promptLower = prompt.toLowerCase();
      
      // Extract room type
      if (promptLower.includes('bedroom')) context.category = 'bedroom';
      else if (promptLower.includes('kitchen')) context.category = 'kitchen';
      else if (promptLower.includes('bathroom')) context.category = 'bathroom';
      else if (promptLower.includes('living')) context.category = 'living room';
      
      // Extract style
      if (promptLower.includes('modern')) context.style = 'modern';
      else if (promptLower.includes('classic')) context.style = 'classic';
      else if (promptLower.includes('vintage')) context.style = 'vintage';
      else if (promptLower.includes('minimalist')) context.style = 'minimalist';
      
      // Extract color
      const colors = ['brown', 'white', 'black', 'gray', 'blue', 'green', 'red', 'yellow'];
      for (const color of colors) {
        if (promptLower.includes(color)) {
          context.color = color;
          break;
        }
      }
    }

    console.log('Extracted context:', context);

    // Find relevant inventory items
    const filter = {
      isDeleted: false,
      available: true,
      stock: { $gt: 0 }
    };

    if (context.category) {
      filter.category = context.category;
    }

    if (context.style) {
      filter.style = new RegExp(context.style, 'i');
    }

    if (context.color) {
      filter.color = new RegExp(context.color, 'i');
    }

    console.log('Inventory filter:', filter);

    // Get items from inventory
    let items = await InventoryItem.find(filter)
      .sort({ price: 1 })
      .limit(5);

    console.log('Found items with filter:', items.length);

    // If no items found with filters, get any available items
    if (!items.length) {
      items = await InventoryItem.find({
        isDeleted: false,
        available: true,
        stock: { $gt: 0 }
      })
      .sort({ price: 1 })
      .limit(5);
      
      console.log('Found items without filter:', items.length);
    }

    const totalCost = items.reduce((sum, item) => sum + item.price, 0);

    console.log('Sending response with items:', items.length);

    res.status(200).json({
      status: 'success',
      data: {
        items,
        totalCost,
        itemCount: items.length,
        context
      }
    });
  } catch (error) {
    console.error('Extract items error:', error);
    next(error);
  }
};

// Download image proxy to avoid CORS issues
exports.downloadImage = async (req, res, next) => {
  try {
    const { imageUrl, filename } = req.body;
    
    console.log('Download image request:', { imageUrl, filename });
    
    if (!imageUrl) {
      return next(new APIError('Image URL is required', 400));
    }

    // Fetch the image from the external URL
    const response = await fetch(imageUrl);
    
    console.log('Fetch response status:', response.status);
    
    if (!response.ok) {
      return next(new APIError('Failed to fetch image', response.status));
    }

    // Get the image buffer
    const buffer = await response.arrayBuffer();
    
    console.log('Image buffer size:', buffer.byteLength);
    
    // Set headers for file download
    const downloadFilename = filename || `design-${Date.now()}.png`;
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Length', buffer.byteLength);
    
    // Send the image buffer
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Download image error:', error);
    next(new APIError('Failed to download image', 500));
  }
};
