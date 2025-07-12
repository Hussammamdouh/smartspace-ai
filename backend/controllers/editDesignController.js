const GeneratedDesign = require('../models/GeneratedDesign');
const InventoryItem = require('../models/InventoryItem');
const { generateImageWithDalle } = require('../services/openaiService');
const { APIError } = require('../middlewares/errorHandler');
const { downloadAndUploadToCloudinary } = require('../services/openaiService');

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

    // Create edit prompt with STRICT preservation rules
    let editPrompt = prompt || `Edit the room design to `;
    
    if (action === 'add') {
      const itemNames = items.map(item => item.name).join(', ');
      editPrompt += `add ${itemNames} to the room. `;
    } else if (action === 'remove') {
      const itemNames = items.map(item => item.name).join(', ');
      editPrompt += `remove ${itemNames} from the room. `;
    }

    // STRICT PRESERVATION INSTRUCTIONS (CONCISE)
    editPrompt += `

STRICT EDITING RULES: This is inpainting, NOT new generation. Preserve EVERYTHING except specified furniture changes.

DO NOT CHANGE: Background, walls, floor, lighting, shadows, windows, doors, ceiling, camera angle, room layout, architectural details, color palette, textures, mood, or any decor not specified.

ONLY modify furniture pixels. ALL other pixels must remain 100% identical. Use exact same camera, lighting, and perspective. If background would change, DO NOT make the change.

NEGATIVE: No background changes, no new elements, no style/lighting changes, no camera movement.
`;

    // Generate new image with the edit using preservation mode
    const originalImageContext = {
      roomType: originalDesign.metadata?.roomType || 'living room',
      style: originalDesign.metadata?.style || 'modern',
      colorScheme: originalDesign.metadata?.colorScheme || 'neutral',
      lighting: originalDesign.metadata?.lighting || 'natural'
    };
    
    const { imageUrl: dalleImageUrl, designId: newDesignId, prompt: generatedPrompt, usedItems } = await generateImageWithDalle(
      editPrompt,
      req.user.id,
      {
        preserveOriginal: true,
        originalImageContext: originalImageContext
      }
    );

    // Upload the edited image to Cloudinary if available
    const { url: imageUrl, public_id: cloudinaryPublicId } = await downloadAndUploadToCloudinary(dalleImageUrl, 'ai-interior-design-edits');

    // Update the existing design instead of creating a new one
    originalDesign.imageUrl = imageUrl;
    originalDesign.public_id = cloudinaryPublicId;
    originalDesign.modelUsed = 'DALL·E 3 (Edited)';
    originalDesign.relatedProducts = usedItems.map(item => item._id);
    
    // Add to edit history
    if (!originalDesign.editHistory) {
      originalDesign.editHistory = [];
    }
    originalDesign.editHistory.push({
      action,
      furnitureItems: items.map(item => item._id),
      prompt: editPrompt,
      timestamp: new Date()
    });

    await originalDesign.save();

    res.status(200).json({
      success: true,
      data: {
        editedDesign: originalDesign,
        originalDesign: originalDesign._id,
        editPrompt,
        newImageUrl: imageUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// Custom prompt edit - doesn't require furniture items
exports.editDesignWithCustomPrompt = async (req, res, next) => {
  try {
    const { designId } = req.params;
    const { 
      prompt, // custom prompt for the edit
      originalImageUrl // URL of the original image to edit
    } = req.body;

    if (!prompt) {
      return next(new APIError('Prompt is required', 400));
    }

    // Get the original design
    const originalDesign = await GeneratedDesign.findOne({
      _id: designId,
      user: req.user.id
    }).populate('relatedProducts');

    if (!originalDesign) {
      return next(new APIError('Design not found', 404));
    }

    // Create edit prompt with STRICT preservation rules
    let editPrompt = prompt.trim();
    
    // STRICT PRESERVATION INSTRUCTIONS (CONCISE)
    editPrompt += `

STRICT EDITING RULES: This is inpainting, NOT new generation. Preserve EVERYTHING except specified furniture changes.

DO NOT CHANGE: Background, walls, floor, lighting, shadows, windows, doors, ceiling, camera angle, room layout, architectural details, color palette, textures, mood, or any decor not specified.

ONLY modify furniture pixels. ALL other pixels must remain 100% identical. Use exact same camera, lighting, and perspective. If background would change, DO NOT make the change.

NEGATIVE: No background changes, no new elements, no style/lighting changes, no camera movement.
`;

    // Generate new image with the edit using preservation mode
    const originalImageContext = {
      roomType: originalDesign.metadata?.roomType || 'living room',
      style: originalDesign.metadata?.style || 'modern',
      colorScheme: originalDesign.metadata?.colorScheme || 'neutral',
      lighting: originalDesign.metadata?.lighting || 'natural'
    };
    
    const { imageUrl: dalleImageUrl, designId: newDesignId, prompt: generatedPrompt, usedItems } = await generateImageWithDalle(
      editPrompt,
      req.user.id,
      {
        preserveOriginal: true,
        originalImageContext: originalImageContext
      }
    );

    // Upload the edited image to Cloudinary if available
    const { url: imageUrl, public_id: cloudinaryPublicId } = await downloadAndUploadToCloudinary(dalleImageUrl, 'ai-interior-design-edits');

    // Update the existing design instead of creating a new one
    originalDesign.imageUrl = imageUrl;
    originalDesign.public_id = cloudinaryPublicId;
    originalDesign.modelUsed = 'DALL·E 3 (Custom Edit)';
    originalDesign.relatedProducts = usedItems.map(item => item._id);
    
    // Add to edit history
    if (!originalDesign.editHistory) {
      originalDesign.editHistory = [];
    }
    originalDesign.editHistory.push({
      action: 'custom_prompt',
      furnitureItems: [],
      prompt: editPrompt,
      timestamp: new Date()
    });

    await originalDesign.save();

    res.status(200).json({
      success: true,
      data: {
        editedDesign: originalDesign,
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