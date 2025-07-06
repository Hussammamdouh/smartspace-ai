const User = require('../models/User');
const Design = require('../models/Design'); // If designs are stored separately
const Order = require('../models/Order');   // If orders are stored separately
const { APIError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

// Fetch user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const {
      name,
      nickName,
      email,
      phone,
      address,
      gender,
      country,
      language,
      timeZone,
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (email && email !== user.email) {
      user.emailHistory.push({ email: user.email, changedAt: new Date() });
      user.email = email;
    }
    
    user.name = name || user.name;
    user.nickName = nickName || user.nickName;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.gender = gender || user.gender;
    user.country = country || user.country;
    user.language = language || user.language;
    user.timeZone = timeZone || user.timeZone;
    

    const updatedUser = await user.save();
    res.status(200).json({ status: 'success', data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Fetch user designs
exports.getUserDesigns = async (req, res, next) => {
  try {
    const designs = await Design.find({ userId: req.user.id });
    res.status(200).json({ success: true, data: designs });
  } catch (error) {
    next(error);
  }
};

// Fetch user purchase history
exports.getUserPurchases = async (req, res, next) => {
  try {
    const purchases = await Order.find({ userId: req.user.id });
    res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    user.avatar = req.file.path; // Save file path
    await user.save();

    res.status(200).json({ success: true, avatar: user.avatar });
  } catch (error) {
    next(error);
  }
};

// ===== ADMIN USER MANAGEMENT =====

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nickName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status === 'active') {
      filter.isBlocked = false;
    } else if (status === 'blocked') {
      filter.isBlocked = true;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting all users:', error);
    next(error);
  }
};

// Get single user by ID (admin only)
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return next(new APIError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    next(error);
  }
};

// Update user (admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isBlocked, phone, gender, country } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(new APIError('User not found', 404));
    }

    // Prevent admin from blocking themselves
    if (id === req.user.id && isBlocked) {
      return next(new APIError('You cannot block yourself', 400));
    }

    // Update fields
    if (name) user.name = name;
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return next(new APIError('Email is already in use', 400));
      }
      user.emailHistory.push({ email: user.email, changedAt: new Date() });
      user.email = email;
    }
    if (role && ['user', 'admin'].includes(role)) {
      // Prevent admin from changing their own role
      if (id === req.user.id) {
        return next(new APIError('You cannot change your own role', 400));
      }
      user.role = role;
    }
    if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (country) user.country = country;

    const updatedUser = await user.save();

    logger.info(`Admin ${req.user.id} updated user ${id}`);

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return next(new APIError('You cannot delete yourself', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new APIError('User not found', 404));
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      return next(new APIError('Cannot delete admin users', 400));
    }

    await User.findByIdAndDelete(id);

    logger.info(`Admin ${req.user.id} deleted user ${id}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};

// Block/Unblock user (admin only)
exports.toggleUserBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from blocking themselves
    if (id === req.user.id) {
      return next(new APIError('You cannot block yourself', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new APIError('User not found', 404));
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    logger.info(`Admin ${req.user.id} ${user.isBlocked ? 'blocked' : 'unblocked'} user ${id}`);

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (error) {
    logger.error('Error toggling user block:', error);
    next(error);
  }
};

// Get user statistics (admin only)
exports.getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
        admins: adminUsers,
        regular: regularUsers,
        recentRegistrations
      }
    });
  } catch (error) {
    logger.error('Error getting user stats:', error);
    next(error);
  }
};

// Get dashboard stats (admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalProducts = await require('../models/InventoryItem').countDocuments();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalSales: totalSales[0]?.total || 0,
        totalProducts,
        recentUsers,
        recentOrders
      }
    });
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    next(error);
  }
};