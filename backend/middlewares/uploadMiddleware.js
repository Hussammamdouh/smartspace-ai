const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, testCloudinaryConnection, isCloudinaryAvailable } = require('../config/cloudinary');
const logger = require('../utils/logger');

// Ensure uploads directory exists for local storage fallback
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage with Cloudinary support
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and add timestamp
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${sanitizedName}`);
  },
});

// File filter for specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB limit for Cloudinary
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Unsupported file type. Only images (JPEG, PNG, WebP, GIF) are allowed.'), false);
  }
  
  if (file.size > maxSize) {
    return cb(new Error('File size too large. Maximum size is 10MB.'), false);
  }
  
  cb(null, true);
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // Only allow 1 file per request
  }
});

// Enhanced upload middleware with Cloudinary support
const uploadWithCloudinary = async (req, res, next) => {
  try {
    // First, use multer to handle the file upload locally
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          error: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file uploaded' 
        });
      }

      try {
        // Check if Cloudinary is available
        const cloudinaryAvailable = isCloudinaryAvailable();
        
        if (cloudinaryAvailable) {
          // Test Cloudinary connection
          const connectionTest = await testCloudinaryConnection();
          
          if (connectionTest) {
            // Upload to Cloudinary
            const cloudinaryResult = await uploadToCloudinary(req.file, 'ai-interior-design');
            
            // Add Cloudinary info to request
            req.file.cloudinary = cloudinaryResult;
            req.file.url = cloudinaryResult.url;
            req.file.public_id = cloudinaryResult.public_id;
            
            // Clean up local file
            fs.unlinkSync(req.file.path);
            req.file.path = null;
            
            logger.info('File uploaded to Cloudinary successfully');
          } else {
            // Fallback to local storage
            req.file.url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            logger.info('File saved locally (Cloudinary connection failed)');
          }
        } else {
          // Fallback to local storage
          req.file.url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
          logger.info('File saved locally (Cloudinary not configured)');
        }

        next();
      } catch (cloudinaryError) {
        logger.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
        
        // Fallback to local storage
        req.file.url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        next();
      }
    });
  } catch (error) {
    logger.error('Upload middleware error:', error);
    res.status(500).json({ 
      error: 'File upload failed' 
    });
  }
};

// Simple multer upload (for backward compatibility)
const simpleUpload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

module.exports = {
  upload: simpleUpload,
  uploadWithCloudinary,
  uploadToCloudinary
};
