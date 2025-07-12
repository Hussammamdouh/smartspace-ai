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

    // Create a temporary file path
    const tempPath = `/tmp/ai-design-${Date.now()}.png`;
    const fs = require('fs');
    fs.writeFileSync(tempPath, response.data);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary({ path: tempPath }, folder);

    // Clean up temporary file
    fs.unlinkSync(tempPath);

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
    const { style: customStyle, size = '1024x1024' } = options;
    const context = extractPromptContext(userPrompt);
    logger.info('Extracted context:', context);

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
    const augmentedPrompt = `
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

    logger.info('Generated prompt:', augmentedPrompt);

    // Generate image with DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: augmentedPrompt,
      size: size,
      quality: "standard",
      n: 1,
    });

    const dalleImageUrl = response.data[0].url;
    logger.info('Image generated successfully from DALL-E');

    // Upload to Cloudinary if available
    const { url: imageUrl, public_id: cloudinaryPublicId } = await downloadAndUploadToCloudinary(dalleImageUrl);
    logger.info('Image uploaded to Cloudinary:', cloudinaryPublicId ? 'Yes' : 'No');

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
    const design = await GeneratedDesign.create({
      user: userId,
      preference: designPreference._id,
      imageUrl,
      public_id: cloudinaryPublicId, // Store Cloudinary public ID for future management
      relatedProducts: selectedItems.map(i => i._id),
      modelUsed: 'DALL·E 3',
      status: 'success',
      metadata: {
        totalCost,
        furnitureCount: selectedItems.length,
        roomType: context.category,
        style: finalStyle,
        colorScheme: context.color,
        originalPrompt: userPrompt,
        enhancedPrompt: augmentedPrompt,
        imageSize: size,
        cloudinaryPublicId
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
