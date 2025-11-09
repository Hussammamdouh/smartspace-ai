const { OpenAI } = require("openai");
const InventoryItem = require("../models/InventoryItem");
const GeneratedDesign = require("../models/GeneratedDesign");
const DesignPreference = require("../models/DesignPreference");
const { extractPromptContext } = require("../utils/promptParser");
const logger = require("../utils/logger");
const { uploadToCloudinary, isCloudinaryAvailable } = require("../config/cloudinary");
const axios = require("axios");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RETRIES = 3;

// Helper function to check for cached designs
const checkCachedDesign = async (promptHash, userId) => {
  try {
    const GeneratedDesign = require('../models/GeneratedDesign');
    const cachedDesign = await GeneratedDesign.findOne({
      'metadata.promptHash': promptHash,
      user: userId,
      status: 'success'
    })
    .sort({ createdAt: -1 })
    .limit(1);
    
    if (cachedDesign) {
      logger.info('Found cached design for prompt hash:', promptHash);
      return cachedDesign;
    }
    return null;
  } catch (error) {
    logger.error('Error checking cache:', error);
    return null;
  }
};

// Helper function to download image from URL and upload to Cloudinary
const downloadAndUploadToCloudinary = async (imageUrl, folder = 'ai-interior-design') => {
  try {
    if (!isCloudinaryAvailable()) {
      logger.warn('Cloudinary not available, returning original URL');
      return { url: imageUrl, public_id: null };
    }

    // Download the image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // Use cross-platform temporary directory
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(os.tmpdir(), 'ai-interior-design');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create a temporary file path
    const tempPath = path.join(tempDir, `ai-design-${Date.now()}.png`);
    fs.writeFileSync(tempPath, response.data);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary({ path: tempPath }, folder);

    // Clean up temporary file
    try {
      fs.unlinkSync(tempPath);
    } catch (cleanupError) {
      logger.warn('Failed to cleanup temp file:', cleanupError.message);
    }

    return uploadResult;
  } catch (error) {
    logger.error('Error uploading to Cloudinary:', error);
    // Fallback to original URL
    return { url: imageUrl, public_id: null };
  }
};

exports.chatWithGPT = async (messages) => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await openai.chat.completions.create({ 
        model: "gpt-3.5-turbo", 
        messages,
        max_tokens: 1000,
        temperature: 0.7
      });
      return res.choices[0].message.content;
    } catch (err) {
      logger.error(`GPT chat attempt ${i + 1} failed:`, err.message);
      if (i === MAX_RETRIES - 1) throw err;
      await new Promise(res => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
    }
  }
};

exports.generateImageWithDalle = async (userPrompt, userId, options = {}) => {
  try {
    const { 
      style: customStyle, 
      size = '1024x1024', 
      quality = 'standard', // 'standard' or 'hd'
      preserveOriginal = false, 
      originalImageContext = null,
      originalImageUrl = null, // For editing existing images
      maskImageUrl = null // For masked editing
    } = options;
    const context = extractPromptContext(userPrompt);
    logger.info('Extracted context:', context);
    logger.info('Preservation mode:', preserveOriginal);

    // Build comprehensive filter for furniture selection
    const filter = { 
      isDeleted: false,
      available: true,
      stock: { $gt: 0 }
    };

    // Add category filter if specified
    if (context.category) {
      filter.category = context.category;
    }

    // Add style filter if specified (use custom style if provided, otherwise from context)
    if (customStyle || context.style) {
      filter.style = new RegExp(customStyle || context.style, 'i');
    }

    // Add color filter if specified
    if (context.color) {
      filter.color = new RegExp(context.color, 'i');
    }

    logger.info('Furniture filter:', filter);

    // Get furniture items with better selection logic
    let items = await InventoryItem.find(filter)
      .sort({ price: 1 }) // Start with affordable items
      .limit(10);

    // If no items found with strict filters, try with broader criteria
    if (!items.length) {
      logger.info('No items found with strict filters, trying broader search');
      const broadFilter = { 
        isDeleted: false,
        available: true,
        stock: { $gt: 0 }
      };
      
      if (context.category) {
        broadFilter.category = context.category;
      }
      
      items = await InventoryItem.find(broadFilter)
        .sort({ price: 1 })
        .limit(10);
    }

    // If still no items, get any available items
    if (!items.length) {
      logger.info('No items found with category filter, getting any available items');
      items = await InventoryItem.find({ 
        isDeleted: false,
        available: true,
        stock: { $gt: 0 }
      })
      .sort({ price: 1 })
      .limit(10);
    }

    if (!items.length) {
      throw new Error("No furniture items available in the inventory.");
    }

    // Select a reasonable number of items (3-5) for the design
    const selectedItems = items.slice(0, Math.min(5, items.length));
    
    const itemNames = selectedItems.map(item => `${item.name} (${item.category})`).join(", ");
    const totalCost = selectedItems.reduce((sum, item) => sum + item.price, 0);
    
    logger.info(`Selected ${selectedItems.length} items with total cost: $${totalCost}`);

    // Use custom style if provided, otherwise use context style
    const finalStyle = customStyle || context.style || 'modern';

    // Create enhanced prompt with specific furniture details
    let augmentedPrompt;
    
    if (preserveOriginal && originalImageContext) {
      // STRICT PRESERVATION MODE - for editing existing designs
      augmentedPrompt = `
        EDIT the existing interior design image with these changes: ${userPrompt.trim()}
        
        CRITICAL PRESERVATION REQUIREMENTS - DO NOT CHANGE ANY OF THESE:
        1. EXACT SAME BACKGROUND: Keep the exact same wall color, texture, and material
        2. EXACT SAME FLOORING: Keep the exact same floor material, color, and pattern
        3. EXACT SAME LIGHTING: Keep the exact same light sources, shadows, and brightness
        4. EXACT SAME CAMERA ANGLE: Maintain the exact same perspective and composition
        5. EXACT SAME ROOM DIMENSIONS: Keep the exact same room size and proportions
        6. EXACT SAME WINDOWS/DOORS: Keep the exact same window and door positions
        7. EXACT SAME ARCHITECTURAL ELEMENTS: Keep all moldings, baseboards, ceiling details
        8. EXACT SAME SHADOWS: Maintain the exact same shadow positions and intensities
        9. EXACT SAME COLOR TEMPERATURE: Keep the exact same warm/cool lighting balance
        10. EXACT SAME ATMOSPHERE: Maintain the exact same mood and ambiance
        
        ORIGINAL IMAGE CONTEXT:
        - Room type: ${originalImageContext.roomType || 'living room'}
        - Design style: ${originalImageContext.style || 'modern'}
        - Color scheme: ${originalImageContext.colorScheme || 'neutral'}
        - Lighting: ${originalImageContext.lighting || 'natural'}
        
        ONLY MODIFY: The specific changes requested above. Everything else must remain identical.
        
        TECHNICAL REQUIREMENTS:
        - Use the exact same camera position and focal length
        - Maintain identical lighting setup and exposure
        - Preserve all architectural details exactly as they are
        - Keep the same color palette and material textures
        - Ensure seamless integration of changes with existing elements
        - Photorealistic quality with natural lighting
        - Professional interior design photography style
        - No cartoon, 3D-rendered, or artificial styles
        - High-end, magazine-quality appearance
      `;
    } else {
      // NEW GENERATION MODE - for creating new designs
      augmentedPrompt = `
        Create a photorealistic interior design image for: ${userPrompt.trim()}.
        
        Include these specific furniture items: ${itemNames}.
        
        Style requirements:
        - Room type: ${context.category || 'living room'}
        - Design style: ${finalStyle}
        - Color scheme: ${context.color || 'neutral'}
        
        Image requirements:
        - Photorealistic quality with natural lighting
        - Professional interior design photography style
        - No cartoon, 3D-rendered, or artificial styles
        - High-end, magazine-quality appearance
        - Proper furniture placement and room layout
      `;
    }

    logger.info('Generated prompt:', augmentedPrompt);

    // Create prompt hash for caching
    const crypto = require('crypto');
    const promptHash = crypto.createHash('sha256').update(augmentedPrompt).digest('hex');
    
    // Check for cached design (only for new generations, not edits)
    if (!preserveOriginal) {
      const cachedDesign = await checkCachedDesign(promptHash, userId);
      if (cachedDesign) {
        logger.info('Returning cached design:', cachedDesign._id);
        // Increment views for cached design
        await cachedDesign.addView();
        
        return {
          imageUrl: cachedDesign.imageUrl,
          designId: cachedDesign._id,
          prompt: augmentedPrompt,
          usedItems: selectedItems,
          totalCost,
          furnitureCount: selectedItems.length,
          cached: true,
          metadata: {
            roomType: context.category,
            style: finalStyle,
            colorScheme: context.color,
            imageSize: size
          }
        };
      }
    }

    // Check if this is an edit operation (has original image)
    let response;
    if (preserveOriginal && originalImageUrl) {
      // DALL-E 3 doesn't support image editing directly, so we use image generation with enhanced prompt
      // For true image editing, we would need DALL-E 2 or use image variation API
      logger.info('Using enhanced prompt for image editing');
      response = await openai.images.generate({
        model: "dall-e-3",
        prompt: augmentedPrompt,
        size: size,
        quality: quality, // Use quality parameter
        n: 1,
      });
    } else {
      // Standard generation
      response = await openai.images.generate({
        model: "dall-e-3",
        prompt: augmentedPrompt,
        size: size,
        quality: quality, // Use quality parameter (standard or hd)
        n: 1,
      });
    }

    const dalleImageUrl = response.data[0].url;
    logger.info('Image generated successfully from DALL-E');

    // Upload to Cloudinary if available
    const { url: imageUrl, public_id: cloudinaryPublicId } = await downloadAndUploadToCloudinary(dalleImageUrl);
    logger.info('Image uploaded to Cloudinary:', cloudinaryPublicId ? 'Yes' : 'No');

    // Calculate API cost (approximate: DALL-E 3 standard = $0.04/image, HD = $0.08/image)
    const apiCost = quality === 'hd' ? 0.08 : 0.04;

    // Create design preference for this generation
    const designPreference = await DesignPreference.create({
      user: userId,
      roomType: context.category || 'living room',
      style: finalStyle,
      colorPalette: context.color ? [context.color] : [],
      additionalNotes: userPrompt,
      estimatedCost: totalCost,
      furnitureCount: selectedItems.length
    });

    // Save the generated design with detailed information
    const generationStartTime = Date.now();
    const design = await GeneratedDesign.create({
      user: userId,
      preference: designPreference._id,
      imageUrl,
      public_id: cloudinaryPublicId, // Store Cloudinary public ID for future management
      relatedProducts: selectedItems.map(i => i._id),
      modelUsed: 'DALL·E 3',
      status: 'success',
      apiCost,
      metadata: {
        totalCost,
        furnitureCount: selectedItems.length,
        roomType: context.category,
        style: finalStyle,
        colorScheme: context.color,
        originalPrompt: userPrompt,
        enhancedPrompt: augmentedPrompt,
        imageSize: size,
        imageQuality: quality,
        cloudinaryPublicId,
        promptHash,
        generationDuration: Date.now() - generationStartTime,
        apiProvider: 'openai',
        modelVersion: 'dall-e-3'
      }
    });

    logger.info(`Design saved with ID: ${design._id}`);

    return {
      imageUrl,
      designId: design._id,
      prompt: augmentedPrompt,
      usedItems: selectedItems,
      totalCost,
      furnitureCount: selectedItems.length,
      metadata: {
        roomType: context.category,
        style: finalStyle,
        colorScheme: context.color,
        imageSize: size
      }
    };
  } catch (error) {
    logger.error('Error in generateImageWithDalle:', error);
    throw error;
  }
};

// Export the helper function for use in other modules
exports.downloadAndUploadToCloudinary = downloadAndUploadToCloudinary;
