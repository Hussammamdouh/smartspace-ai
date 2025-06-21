const User = require('../models/User');
const Design = require('../models/Design'); // If designs are stored separately
const Order = require('../models/Order');   // If orders are stored separately

// Fetch user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
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
    user.gender = gender || user.gender;
    user.country = country || user.country;
    user.language = language || user.language;
    user.timeZone = timeZone || user.timeZone;
    

    const updatedUser = await user.save();
    res.status(200).json({ success: true, data: updatedUser });
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