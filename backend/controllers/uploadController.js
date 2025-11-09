const { uploadToCloudinary, deleteFromCloudinary, testCloudinaryConnection, isCloudinaryAvailable } = require('../config/cloudinary');
const logger = require('../utils/logger');

/**
 * Upload a single image file
 * Supports: avatar, file, image field names
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const result = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: req.file.url,
      public_id: req.file.public_id,
      cloudinary: req.file.cloudinary || null
    };

    res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: result
    });
  } catch (error) {
    logger.error('Upload controller error:', error);
    next(error);
  }
};

/**
 * Delete an image from Cloudinary
 */
exports.deleteImage = async (req, res, next) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Public ID is required'
      });
    }

    await deleteFromCloudinary(public_id);

    res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully'
    });
  } catch (error) {
    logger.error('Delete image error:', error);
    next(error);
  }
};

/**
 * Test Cloudinary connection
 */
exports.testConnection = async (req, res, next) => {
  try {
    const available = isCloudinaryAvailable();
    const connected = available ? await testCloudinaryConnection() : false;

    res.status(200).json({
      status: 'success',
      data: {
        configured: available,
        connected: connected,
        message: available 
          ? (connected ? 'Cloudinary is configured and connected' : 'Cloudinary is configured but connection test failed')
          : 'Cloudinary is not configured'
      }
    });
  } catch (error) {
    logger.error('Cloudinary test error:', error);
    next(error);
  }
};






