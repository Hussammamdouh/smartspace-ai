const GeneratedDesign = require('../models/GeneratedDesign');
const InventoryItem = require('../models/InventoryItem');
const { generateImageWithDalle } = require('../services/openaiService');
const { APIError } = require('../middlewares/errorHandler');

// Get design for editing
exports.getDesignForEdit = async (req, res, next) => {
  try {
    const { designId } = req.params;

    const design = await GeneratedDesign.findOne({
      _id: designId,
      user: req.user.id
    }).populate('relatedProducts');

    if (!design) {
      return next(new APIError('Design not found', 404));
    }

    res.status(200).json({
      success: true,
      data: design
    });
  } catch (error) {
    next(error);
  }
};

// Get available furniture items for editing
exports.getAvailableFurniture = async (req, res, next) => {
  try {
    const { category, style, color, search } = req.query;

    const filter = {
      isDeleted: false,
      available: true
    };

    if (category) filter.category = category;
    if (style) filter.style = style;
    if (color) filter.color = new RegExp(color, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const furniture = await InventoryItem.find(filter)
      .select('name description price image category style color tags')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: furniture
    });
  } catch (error) {
    next(error);
  }
};

// Edit design by adding/removing furniture
exports.editDesign = async (req, res, next) => {
  try {
    const { designId } = req.params;
    const { 
      action, // 'add' or 'remove'
      furnitureItems, // array of furniture item IDs
      prompt, // custom prompt for the edit
      originalImageUrl // URL of the original image to edit
    } = req.body;

    if (!action || !furnitureItems || !Array.isArray(furnitureItems)) {
      return next(new APIError('Invalid edit parameters', 400));
    }

    // Get the original design
    const originalDesign = await GeneratedDesign.findOne({
      _id: designId,
      user: req.user.id
    }).populate('relatedProducts');

    if (!originalDesign) {
      return next(new APIError('Design not found', 404));
    }

    // Get the furniture items
    const items = await InventoryItem.find({
      _id: { $in: furnitureItems },
      isDeleted: false,
      available: true
    });

    if (items.length === 0) {
      return next(new APIError('No valid furniture items found', 400));
    }

    // Create edit prompt
    let editPrompt = prompt || `Edit the room design to `;
    
    if (action === 'add') {
      const itemNames = items.map(item => item.name).join(', ');
      editPrompt += `add ${itemNames} to the room. Make sure the new furniture fits well with the existing design and style.`;
    } else if (action === 'remove') {
      const itemNames = items.map(item => item.name).join(', ');
      editPrompt += `remove ${itemNames} from the room and replace with appropriate alternatives.`;
    }

    // Generate new image with the edit
    const { imageUrl, designId: newDesignId, prompt: generatedPrompt, usedItems } = await generateImageWithDalle(
      editPrompt,
      req.user.id
    );

    // Create a new design entry for the edited version
    const editedDesign = await GeneratedDesign.create({
      user: req.user.id,
      preference: originalDesign.preference,
      imageUrl,
      relatedProducts: usedItems.map(item => item._id),
      modelUsed: 'DALL·E 3 (Edited)',
      status: 'success',
      originalDesign: designId, // Reference to the original design
      editHistory: [{
        action,
        furnitureItems: items.map(item => item._id),
        prompt: editPrompt,
        timestamp: new Date()
      }]
    });

    res.status(201).json({
      success: true,
      data: {
        editedDesign,
        originalDesign: originalDesign._id,
        editPrompt,
        newImageUrl: imageUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get design edit history
exports.getDesignEditHistory = async (req, res, next) => {
  try {
    const { designId } = req.params;

    const designs = await GeneratedDesign.find({
      $or: [
        { _id: designId },
        { originalDesign: designId }
      ],
      user: req.user.id
    })
    .populate('relatedProducts')
    .populate('editHistory.furnitureItems')
    .sort({ createdAt: 1 });

    if (designs.length === 0) {
      return next(new APIError('Design not found', 404));
    }

    res.status(200).json({
      success: true,
      data: designs
    });
  } catch (error) {
    next(error);
  }
};

// Save design edit preferences
exports.saveEditPreferences = async (req, res, next) => {
  try {
    const { designId } = req.params;
    const { 
      furniturePreferences, // array of preferred furniture items
      stylePreferences, // style changes
      colorPreferences, // color changes
      notes // additional notes
    } = req.body;

    const design = await GeneratedDesign.findOne({
      _id: designId,
      user: req.user.id
    });

    if (!design) {
      return next(new APIError('Design not found', 404));
    }

    // Update design with edit preferences
    design.editPreferences = {
      furniturePreferences,
      stylePreferences,
      colorPreferences,
      notes,
      updatedAt: new Date()
    };

    await design.save();

    res.status(200).json({
      success: true,
      data: design
    });
  } catch (error) {
    next(error);
  }
};

// Export design as final version
exports.exportDesign = async (req, res, next) => {
  try {
    const { designId } = req.params;
    const { format = 'image' } = req.query; // image, pdf, etc.

    const design = await GeneratedDesign.findOne({
      _id: designId,
      user: req.user.id
    }).populate('relatedProducts');

    if (!design) {
      return next(new APIError('Design not found', 404));
    }

    // For now, just return the image URL
    // In the future, this could generate PDFs, 3D models, etc.
    res.status(200).json({
      success: true,
      data: {
        designId: design._id,
        imageUrl: design.imageUrl,
        relatedProducts: design.relatedProducts,
        exportFormat: format,
        exportUrl: design.imageUrl // For now, same as imageUrl
      }
    });
  } catch (error) {
    next(error);
  }
}; 