const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, isCloudinaryAvailable } = require('../config/cloudinary');
const logger = require('../utils/logger');
const InventoryItem = require('../models/InventoryItem');

// White background templates for different room types
const WHITE_BACKGROUND_TEMPLATES = {
  'living room': '/templates/white-living-room.png',
  'bedroom': '/templates/white-bedroom.png',
  'kitchen': '/templates/white-kitchen.png',
  'bathroom': '/templates/white-bathroom.png',
  'child bedroom': '/templates/white-child-bedroom.png',
  'dining room': '/templates/white-dining-room.png',
  'office': '/templates/white-office.png',
  'default': '/templates/white-living-room.png'
};

// Furniture positioning presets for different room types
const FURNITURE_POSITIONS = {
  'living room': {
    'sofa': { x: 200, y: 300, width: 400, height: 200 },
    'coffee table': { x: 350, y: 450, width: 150, height: 80 },
    'armchair': { x: 650, y: 300, width: 120, height: 120 },
    'tv stand': { x: 200, y: 100, width: 300, height: 60 },
    'bookshelf': { x: 700, y: 100, width: 100, height: 300 },
    'lamp': { x: 600, y: 200, width: 60, height: 120 },
    'rug': { x: 250, y: 350, width: 300, height: 200 }
  },
  'bedroom': {
    'bed': { x: 150, y: 200, width: 300, height: 250 },
    'nightstand': { x: 500, y: 300, width: 80, height: 60 },
    'dresser': { x: 600, y: 150, width: 200, height: 100 },
    'lamp': { x: 520, y: 320, width: 40, height: 80 },
    'mirror': { x: 650, y: 100, width: 100, height: 120 },
    'rug': { x: 200, y: 300, width: 200, height: 150 }
  },
  'kitchen': {
    'kitchen cabinet': { x: 100, y: 100, width: 300, height: 200 },
    'refrigerator': { x: 450, y: 100, width: 120, height: 250 },
    'stove': { x: 200, y: 350, width: 150, height: 100 },
    'sink': { x: 400, y: 350, width: 100, height: 80 },
    'dining table': { x: 600, y: 200, width: 200, height: 120 },
    'chair': { x: 650, y: 250, width: 60, height: 80 }
  },
  'bathroom': {
    'toilet': { x: 200, y: 300, width: 80, height: 120 },
    'sink': { x: 400, y: 200, width: 100, height: 80 },
    'bathtub': { x: 550, y: 250, width: 200, height: 120 },
    'shower': { x: 550, y: 250, width: 120, height: 200 },
    'mirror': { x: 420, y: 100, width: 60, height: 80 },
    'towel rack': { x: 300, y: 150, width: 80, height: 40 }
  },
  'child bedroom': {
    'bed': { x: 150, y: 200, width: 250, height: 200 },
    'desk': { x: 450, y: 200, width: 150, height: 80 },
    'chair': { x: 500, y: 250, width: 50, height: 60 },
    'bookshelf': { x: 650, y: 100, width: 80, height: 250 },
    'toy box': { x: 200, y: 450, width: 100, height: 80 },
    'rug': { x: 250, y: 300, width: 150, height: 120 }
  }
};

// Helper function to get template path
const getTemplatePath = (roomType) => {
  const templatePath = WHITE_BACKGROUND_TEMPLATES[roomType] || WHITE_BACKGROUND_TEMPLATES.default;
  return path.join(__dirname, '..', 'public', templatePath);
};

// Helper function to create a white background template
const createWhiteBackgroundTemplate = async (roomType, width = 1024, height = 1024) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Create pure white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle grid lines for reference (optional)
  ctx.strokeStyle = '#F0F0F0';
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 0; x <= width; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += 100) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Add room type label
  ctx.fillStyle = '#CCCCCC';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${roomType.toUpperCase()} - WHITE BACKGROUND`, width / 2, 50);
  
  return canvas;
};

// Helper function to load and resize furniture image
const loadFurnitureImage = async (imageUrl, targetWidth, targetHeight) => {
  try {
    const image = await loadImage(imageUrl);
    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    
    // Calculate aspect ratio to maintain proportions
    const aspectRatio = image.width / image.height;
    let drawWidth = targetWidth;
    let drawHeight = targetHeight;
    
    if (aspectRatio > 1) {
      // Image is wider than tall
      drawHeight = targetWidth / aspectRatio;
    } else {
      // Image is taller than wide
      drawWidth = targetHeight * aspectRatio;
    }
    
    // Center the image
    const x = (targetWidth - drawWidth) / 2;
    const y = (targetHeight - drawHeight) / 2;
    
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    return canvas;
  } catch (error) {
    logger.error('Error loading furniture image:', error);
    // Return a placeholder if image fails to load
    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.fillStyle = '#999999';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Furniture', targetWidth / 2, targetHeight / 2);
    return canvas;
  }
};

// Main function to apply furniture to white background
exports.applyFurnitureToWhiteBackground = async (furnitureItems, roomType = 'living room', options = {}) => {
  try {
    const { width = 1024, height = 1024, preserveLayout = true } = options;
    
    logger.info(`Applying ${furnitureItems.length} furniture items to white background for ${roomType}`);
    
    // Create white background canvas
    const backgroundCanvas = await createWhiteBackgroundTemplate(roomType, width, height);
    const ctx = backgroundCanvas.getContext('2d');
    
    // Get furniture positions for this room type
    const positions = FURNITURE_POSITIONS[roomType] || FURNITURE_POSITIONS['living room'];
    
    // Apply each furniture item
    for (let i = 0; i < furnitureItems.length; i++) {
      const item = furnitureItems[i];
      
      // Get position for this furniture type
      const itemType = item.category?.toLowerCase() || 'furniture';
      const position = positions[itemType] || positions['furniture'] || {
        x: 100 + (i * 150),
        y: 200 + (i * 100),
        width: 120,
        height: 120
      };
      
      try {
        // Load and resize furniture image
        const furnitureCanvas = await loadFurnitureImage(
          item.image || item.filePath,
          position.width,
          position.height
        );
        
        // Apply furniture to background
        ctx.drawImage(
          furnitureCanvas,
          position.x,
          position.y,
          position.width,
          position.height
        );
        
        logger.info(`Applied ${item.name} at position (${position.x}, ${position.y})`);
      } catch (error) {
        logger.error(`Failed to apply furniture item ${item.name}:`, error);
      }
    }
    
    // Convert canvas to buffer
    const buffer = backgroundCanvas.toBuffer('image/png');
    
    // Upload to Cloudinary if available
    let imageUrl;
    let publicId = null;
    
    if (isCloudinaryAvailable()) {
      // Save buffer to temporary file
      const os = require('os');
      const tempPath = path.join(os.tmpdir(), `white-background-${Date.now()}.png`);
      fs.writeFileSync(tempPath, buffer);
      
      try {
        const uploadResult = await uploadToCloudinary({ path: tempPath }, 'ai-interior-design-white-background');
        imageUrl = uploadResult.url;
        publicId = uploadResult.public_id;
        
        // Clean up temp file
        fs.unlinkSync(tempPath);
      } catch (uploadError) {
        logger.error('Error uploading to Cloudinary:', uploadError);
        // Fallback: convert buffer to data URL
        imageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
      }
    } else {
      // Fallback: convert buffer to data URL
      imageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    }
    
    logger.info('Successfully created white background design with furniture');
    
    return {
      imageUrl,
      publicId,
      furnitureCount: furnitureItems.length,
      roomType,
      layout: 'white-background-fixed',
      metadata: {
        method: 'white-background-overlay',
        furnitureItems: furnitureItems.map(item => ({
          id: item._id,
          name: item.name,
          category: item.category,
          position: positions[item.category?.toLowerCase()] || 'auto-positioned'
        })),
        backgroundType: 'white',
        layoutPreserved: preserveLayout
      }
    };
  } catch (error) {
    logger.error('Error applying furniture to white background:', error);
    throw error;
  }
};

// Function to get available furniture positions for a room type
exports.getFurniturePositions = (roomType) => {
  return FURNITURE_POSITIONS[roomType] || FURNITURE_POSITIONS['living room'];
};

// Function to create a custom white background template
exports.createCustomWhiteBackground = async (roomType, customOptions = {}) => {
  const { width = 1024, height = 1024, gridLines = true, label = true } = customOptions;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Pure white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  
  if (gridLines) {
    // Add subtle grid lines
    ctx.strokeStyle = '#F0F0F0';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  
  if (label) {
    // Add room type label
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${roomType.toUpperCase()} - WHITE BACKGROUND`, width / 2, 50);
  }
  
  return canvas;
}; 