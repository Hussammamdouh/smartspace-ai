const GeneratedDesign = require('../models/GeneratedDesign');
const InventoryItem = require('../models/InventoryItem');
const DesignPreference = require('../models/DesignPreference');
const { APIError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const { applyFurnitureToWhiteBackground } = require('../services/whiteBackgroundService');
const { downloadAndUploadToCloudinary, generateImageWithDalle } = require('../services/openaiService');

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

// Edit design by adding/removing furniture - uses DALL-E for better quality
exports.editDesign = async (req, res, next) => {
  try {
    const { designId } = req.params;
    const { 
      action, // 'add' or 'remove'
      furnitureItems, // array of furniture item IDs
      prompt, // custom prompt for the edit
      originalImageUrl, // URL of the original image to edit
      quality = 'standard', // 'standard' or 'hd'
      size = '1024x1024'
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

    // Save current version before editing
    if (!originalDesign.versions) {
      originalDesign.versions = [];
    }
    originalDesign.versions.push({
      versionNumber: originalDesign.currentVersion,
      imageUrl: originalDesign.imageUrl,
      public_id: originalDesign.public_id,
      editDescription: `Before ${action} operation`,
      createdAt: new Date(),
      metadata: { ...originalDesign.metadata }
    });
    originalDesign.currentVersion += 1;

    // Get the furniture items
    const items = await InventoryItem.find({
      _id: { $in: furnitureItems },
      isDeleted: false,
      available: true
    });

    if (items.length === 0) {
      return next(new APIError('No valid furniture items found', 400));
    }

    // Use DALL-E with enhanced prompt for editing
    const roomType = originalDesign.metadata?.roomType || 'living room';
    const originalStyle = originalDesign.metadata?.style || 'modern';
    const originalColorScheme = originalDesign.metadata?.colorScheme || 'neutral';
    
    // Create edit prompt based on action
    const actionPrompt = action === 'add' 
      ? `Add these furniture items: ${items.map(i => i.name).join(', ')}`
      : `Remove these furniture items: ${items.map(i => i.name).join(', ')}`;
    
    const editPrompt = prompt || `
      Edit this ${roomType} interior design: ${actionPrompt}
      
      PRESERVE FROM ORIGINAL:
      - Room type: ${roomType}
      - Design style: ${originalStyle}
      - Color scheme: ${originalColorScheme}
      - Overall layout and structure
      - Architectural elements
      - Lighting setup
      
      ${action === 'add' ? 'ADD these items naturally into the design' : 'REMOVE these items while maintaining the design integrity'}
    `;

    // Generate new image using DALL-E
    const result = await generateImageWithDalle(editPrompt, req.user.id, {
      preserveOriginal: true,
      originalImageContext: {
        roomType,
        style: originalStyle,
        colorScheme: originalColorScheme,
        lighting: originalDesign.metadata?.lighting || 'natural'
      },
      originalImageUrl: originalImageUrl || originalDesign.imageUrl,
      quality,
      size
    });

    // Update the existing design
    const oldImageUrl = originalDesign.imageUrl;
    originalDesign.imageUrl = result.imageUrl;
    originalDesign.public_id = result.public_id || originalDesign.public_id;
    originalDesign.modelUsed = 'DALL·E 3 (Edit)';
    
    if (action === 'add') {
      // Add new items to related products
      const existingIds = originalDesign.relatedProducts.map(id => id.toString());
      const newItems = items.filter(item => !existingIds.includes(item._id.toString()));
      originalDesign.relatedProducts = [...originalDesign.relatedProducts, ...newItems.map(item => item._id)];
    } else {
      // Remove items from related products
      const removeIds = items.map(item => item._id.toString());
      originalDesign.relatedProducts = originalDesign.relatedProducts.filter(id => !removeIds.includes(id.toString()));
    }
    
    // Add to edit history
    if (!originalDesign.editHistory) {
      originalDesign.editHistory = [];
    }
    originalDesign.editHistory.push({
      action,
      furnitureItems: items.map(item => item._id),
      prompt: editPrompt,
      timestamp: new Date(),
      method: 'dall-e-3-enhanced-prompt',
      previousImageUrl: oldImageUrl
    });

    // Update metadata
    originalDesign.metadata = {
      ...originalDesign.metadata,
      lastEdit: new Date(),
      editMethod: 'dall-e-3-enhanced-prompt',
      furnitureCount: originalDesign.relatedProducts.length,
      imageQuality: quality,
      imageSize: size,
      version: originalDesign.currentVersion
    };

    await originalDesign.save();

    res.status(200).json({
      success: true,
      data: {
        editedDesign: originalDesign,
        originalDesign: originalDesign._id,
        editPrompt: editPrompt,
        newImageUrl: result.imageUrl,
        previousImageUrl: oldImageUrl,
        method: 'dall-e-3-enhanced-prompt',
        version: originalDesign.currentVersion
      }
    });
  } catch (error) {
    logger.error('Error editing design:', error);
    next(error);
  }
};

// Custom prompt edit - uses DALL-E with enhanced prompt for better preservation
exports.editDesignWithCustomPrompt = async (req, res, next) => {
  try {
    const { designId } = req.params;
    const { 
      prompt, // custom prompt for the edit
      originalImageUrl, // URL of the original image to edit
      furnitureItems = [], // optional furniture items to include
      quality = 'standard', // 'standard' or 'hd'
      size = '1024x1024'
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

    // Save current version before editing
    if (!originalDesign.versions) {
      originalDesign.versions = [];
    }
    originalDesign.versions.push({
      versionNumber: originalDesign.currentVersion,
      imageUrl: originalDesign.imageUrl,
      public_id: originalDesign.public_id,
      editDescription: 'Before edit',
      createdAt: new Date(),
      metadata: { ...originalDesign.metadata }
    });
    originalDesign.currentVersion += 1;

    let items = [];
    
    // If furniture items are specified, get them
    if (furnitureItems && furnitureItems.length > 0) {
      items = await InventoryItem.find({
        _id: { $in: furnitureItems },
        isDeleted: false,
        available: true
      });
    }

    // Use DALL-E with enhanced prompt that preserves original design context
    const { generateImageWithDalle } = require('../services/openaiService');
    const roomType = originalDesign.metadata?.roomType || 'living room';
    const originalStyle = originalDesign.metadata?.style || 'modern';
    const originalColorScheme = originalDesign.metadata?.colorScheme || 'neutral';
    
    // Create enhanced edit prompt
    const editPrompt = `
      Edit this ${roomType} interior design: ${prompt.trim()}
      
      PRESERVE FROM ORIGINAL:
      - Room type: ${roomType}
      - Design style: ${originalStyle}
      - Color scheme: ${originalColorScheme}
      - Overall layout and structure
      - Architectural elements
      - Lighting setup
      
      ONLY MODIFY: ${prompt.trim()}
      
      ${items.length > 0 ? `Include these furniture items: ${items.map(i => i.name).join(', ')}` : ''}
    `;

    // Generate new image using DALL-E with preservation context
    const result = await generateImageWithDalle(editPrompt, req.user.id, {
      preserveOriginal: true,
      originalImageContext: {
        roomType,
        style: originalStyle,
        colorScheme: originalColorScheme,
        lighting: originalDesign.metadata?.lighting || 'natural'
      },
      originalImageUrl: originalImageUrl || originalDesign.imageUrl,
      quality,
      size
    });

    // Update the existing design
    const oldImageUrl = originalDesign.imageUrl;
    originalDesign.imageUrl = result.imageUrl;
    originalDesign.public_id = result.public_id || originalDesign.public_id;
    originalDesign.modelUsed = 'DALL·E 3 (Edit)';
    
    if (items.length > 0) {
      originalDesign.relatedProducts = items.map(item => item._id);
    }
    
    // Add to edit history
    if (!originalDesign.editHistory) {
      originalDesign.editHistory = [];
    }
    originalDesign.editHistory.push({
      action: 'custom-prompt',
      furnitureItems: items.map(item => item._id),
      prompt: prompt,
      timestamp: new Date(),
      method: 'dall-e-3-enhanced-prompt',
      previousImageUrl: oldImageUrl
    });

    // Update metadata
    originalDesign.metadata = {
      ...originalDesign.metadata,
      lastEdit: new Date(),
      editMethod: 'dall-e-3-enhanced-prompt',
      customPrompt: prompt,
      imageQuality: quality,
      imageSize: size,
      version: originalDesign.currentVersion
    };

    await originalDesign.save();

    res.status(200).json({
      success: true,
      data: {
        editedDesign: originalDesign,
        originalDesign: originalDesign._id,
        editPrompt: prompt,
        newImageUrl: result.imageUrl,
        previousImageUrl: oldImageUrl,
        method: 'dall-e-3-enhanced-prompt',
        version: originalDesign.currentVersion
      }
    });
  } catch (error) {
    logger.error('Error editing design with custom prompt:', error);
    next(error);
  }
};

// Get design edit history
exports.getDesignEditHistory = async (req, res, next) => {
  try {
    const { designId } = req.params;

    const design = await GeneratedDesign.findOne({
      _id: designId,
      user: req.user.id
    })
    .populate('relatedProducts')
    .populate('editHistory.furnitureItems');

    if (!design) {
      return next(new APIError('Design not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        design,
        editHistory: design.editHistory || [],
        versions: design.versions || [],
        currentVersion: design.currentVersion || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get specific version of design
exports.getDesignVersion = async (req, res, next) => {
  try {
    const { designId, versionNumber } = req.params;

    const design = await GeneratedDesign.findOne({
      _id: designId,
      user: req.user.id
    });

    if (!design) {
      return next(new APIError('Design not found', 404));
    }

    const version = design.versions?.find(v => v.versionNumber === Number(versionNumber));
    
    if (!version) {
      return next(new APIError('Version not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        version,
        designId: design._id,
        currentVersion: design.currentVersion
      }
    });
  } catch (error) {
    next(error);
  }
};

// Restore design to a previous version
exports.restoreDesignVersion = async (req, res, next) => {
  try {
    const { designId, versionNumber } = req.params;

    const design = await GeneratedDesign.findOne({
      _id: designId,
      user: req.user.id
    });

    if (!design) {
      return next(new APIError('Design not found', 404));
    }

    const version = design.versions?.find(v => v.versionNumber === Number(versionNumber));
    
    if (!version) {
      return next(new APIError('Version not found', 404));
    }

    // Save current version before restoring
    if (!design.versions) {
      design.versions = [];
    }
    design.versions.push({
      versionNumber: design.currentVersion,
      imageUrl: design.imageUrl,
      public_id: design.public_id,
      editDescription: 'Before version restore',
      createdAt: new Date(),
      metadata: { ...design.metadata }
    });

    // Restore to selected version
    design.imageUrl = version.imageUrl;
    design.public_id = version.public_id;
    design.currentVersion += 1;
    
    design.editHistory.push({
      action: 'restore',
      prompt: `Restored to version ${versionNumber}`,
      timestamp: new Date(),
      method: 'version-restore'
    });

    await design.save();

    res.status(200).json({
      success: true,
      data: {
        design,
        restoredVersion: versionNumber,
        currentVersion: design.currentVersion
      }
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