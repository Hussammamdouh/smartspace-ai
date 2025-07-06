const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Check if Cloudinary credentials are available
const hasCloudinaryCredentials = () => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && 
           process.env.CLOUDINARY_API_KEY && 
           process.env.CLOUDINARY_API_SECRET);
};

// Configure Cloudinary only if credentials are available
if (hasCloudinaryCredentials()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('Cloudinary configured successfully');
} else {
  logger.warn('Cloudinary credentials not found. Cloud storage will be disabled.');
}

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    if (!hasCloudinaryCredentials()) {
      return false;
    }
    
    // Test the connection by getting account info
    const result = await cloudinary.api.ping();
    logger.info('Cloudinary connection test successful');
    return true;
  } catch (error) {
    logger.error('Cloudinary connection test failed:', error.message);
    return false;
  }
};

// Upload image to Cloudinary
const uploadToCloudinary = async (file, folder = 'ai-interior-design') => {
  try {
    if (!hasCloudinaryCredentials()) {
      throw new Error('Cloudinary not configured');
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    logger.error('Cloudinary upload failed:', error);
    throw error;
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (public_id) => {
  try {
    if (!hasCloudinaryCredentials()) {
      return;
    }

    const result = await cloudinary.uploader.destroy(public_id);
    logger.info('Image deleted from Cloudinary:', public_id);
    return result;
  } catch (error) {
    logger.error('Failed to delete image from Cloudinary:', error);
    throw error;
  }
};

// Check if Cloudinary is available
const isCloudinaryAvailable = () => {
  return hasCloudinaryCredentials();
};

module.exports = {
  cloudinary,
  testCloudinaryConnection,
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryAvailable,
  hasCloudinaryCredentials
}; 