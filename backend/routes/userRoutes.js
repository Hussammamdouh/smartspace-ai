const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getUserDesigns,
  getUserPurchases,
  uploadAvatar,
  getAllUsers,
  getUserStats,
  getDashboardStats,
  getHomeStats,
} = require('../controllers/userController');
const { uploadAvatarWithCloudinary } = require("../middlewares/uploadMiddleware");
const { protect, admin } = require('../middlewares/auth');
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
router.patch('/avatar', protect, uploadAvatarWithCloudinary, uploadAvatar);

// Public stats endpoint
router.get('/home-stats', getHomeStats);

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.get('/stats', protect, admin, getUserStats);
router.get('/dashboard', protect, admin, getDashboardStats);

module.exports = router;
