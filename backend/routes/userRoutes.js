const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getUserDesigns,
  getUserPurchases,
  uploadAvatar,
} = require('../controllers/userController');
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require('../middlewares/authMiddleware');
const {validate} = require('../middlewares/validateMiddleware');
const { updateProfileSchema } = require('../utils/validationSchemas');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User dashboard routes
 */

// Fetch user profile
router.get('/profile', protect, getUserProfile);

// Update user profile
router.put('/profile', protect, validate(updateProfileSchema), updateUserProfile);

// Fetch user designs
router.get('/designs', protect, getUserDesigns);

// Fetch user purchase history
router.get('/purchases', protect, getUserPurchases);
router.patch('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
