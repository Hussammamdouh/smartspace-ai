const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, testCloudinaryConnection, isCloudinaryAvailable } = require('../config/cloudinary');
const logger = require('../utils/logger');

// Check if running on Vercel (serverless environment)
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Ensure uploads directory exists for local storage fallback (only if not on Vercel)
const uploadsDir = 'uploads/';
if (!isVercel && !fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (error) {
    logger.warn('Could not create uploads directory:', error.message);
  }
}

// Configure storage with Cloudinary support
// Use memory storage on Vercel (serverless), disk storage otherwise
const storage = isVercel 
  ? multer.memoryStorage() // Memory storage for serverless environments
  : multer.diskStorage({
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

// Factory function to create upload middleware with Cloudinary support for different field names
const createUploadWithCloudinary = (fieldName = 'image') => {
  return async (req, res, next) => {
    try {
      // Use multer to handle the file upload locally
      upload.single(fieldName)(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ 
            error: err.message 
          });
        }

        if (!req.file) {
          return res.status(400).json({ 
            error: `No file uploaded with field name: ${fieldName}` 
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
            
            // Clean up local file (only if using disk storage)
            if (req.file.path && !isVercel) {
              try {
                fs.unlinkSync(req.file.path);
                req.file.path = null;
              } catch (unlinkError) {
                logger.warn('Could not delete local file:', unlinkError.message);
              }
            }
            
            logger.info('File uploaded to Cloudinary successfully');
          } else {
            // Fallback to local storage (only if not on Vercel)
            if (!isVercel && req.file.path) {
              req.file.url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
              logger.info('File saved locally (Cloudinary connection failed)');
            } else {
              return res.status(500).json({ 
                error: 'File upload failed: Cloudinary not available and local storage not supported in serverless environment' 
              });
            }
          }
        } else {
          // Fallback to local storage (only if not on Vercel)
          if (!isVercel && req.file.path) {
            req.file.url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            logger.info('File saved locally (Cloudinary not configured)');
          } else {
            return res.status(500).json({ 
              error: 'File upload failed: Cloudinary not configured and local storage not supported in serverless environment' 
            });
          }
        }

        next();
      } catch (cloudinaryError) {
        logger.error('Cloudinary upload failed:', cloudinaryError);
        
        // Fallback to local storage (only if not on Vercel)
        if (!isVercel && req.file.path) {
          req.file.url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
          next();
        } else {
          return res.status(500).json({ 
            error: 'File upload failed: Cloudinary error and local storage not supported in serverless environment' 
          });
        }
      }
      });
    } catch (error) {
      logger.error('Upload middleware error:', error);
      res.status(500).json({ 
        error: 'File upload failed' 
      });
    }
  };
};

// Pre-configured middleware for common field names
const uploadWithCloudinary = createUploadWithCloudinary('image');
const uploadAvatarWithCloudinary = createUploadWithCloudinary('avatar');
const uploadFileWithCloudinary = createUploadWithCloudinary('file');

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
  uploadAvatarWithCloudinary,
  uploadFileWithCloudinary,
  createUploadWithCloudinary,
  uploadToCloudinary
};
