const Design = require('../models/Design');
const GeneratedDesign = require('../models/GeneratedDesign');
const DesignPreference = require('../models/DesignPreference');
const InventoryItem = require('../models/InventoryItem');
const aiImageService = require('../utils/aiImageService');
const paginate = require('../utils/paginate');
const { deleteFromCloudinary } = require('../config/cloudinary');
const User = require('../models/User');

exports.getUserDesigns = async (userId, filters, page = 1, limit = 10) => {
  const queryObj = { userId };

  if (filters.roomType) queryObj.roomType = filters.roomType;
  if (filters.style) queryObj.style = filters.style;
  if (filters.startDate || filters.endDate) {
    queryObj.createdAt = {};
    if (filters.startDate) queryObj.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) queryObj.createdAt.$lte = new Date(filters.endDate);
  }

  const { query, meta } = paginate(Design.find(queryObj), page, limit);
  const designs = await query.exec();
  const totalDesigns = await Design.countDocuments(queryObj);

  return {
    data: designs,
    meta: {
      ...meta,
      totalDesigns,
      totalPages: Math.ceil(totalDesigns / limit),
    },
  };
};

exports.createDesign = async (data) => {
  return await Design.create(data);
};

exports.deleteDesign = async (id) => {
  const design = await Design.findById(id);
  if (design && design.public_id) {
    await deleteFromCloudinary(design.public_id);
  }
  return await Design.findByIdAndDelete(id);
};

exports.generateImageDesign = async (preferenceId, userId) => {
  const preferences = await DesignPreference.findById(preferenceId);
  if (!preferences) throw new Error('Preferences not found');

  const matchingItems = await InventoryItem.find({
    tags: { $in: [preferences.style, preferences.roomType] }
  }).limit(10);

  const imageResult = await aiImageService.generateRoomImage(preferences, matchingItems);

  const generatedDesign = await GeneratedDesign.create({
    user: userId,
    preference: preferences._id,
    imageUrl: imageResult.url,
    public_id: imageResult.public_id,
    relatedProducts: matchingItems.map(item => item._id),
    modelUsed: 'DALL·E 3',
    status: 'success',
  });

  return generatedDesign;
};

exports.getUserGeneratedDesigns = async (userId) => {
  return await GeneratedDesign.find({ user: userId })
    .populate('preference')
    .populate('relatedProducts');
};

exports.deleteGeneratedDesign = async (id) => {
  const generatedDesign = await GeneratedDesign.findById(id);
  if (generatedDesign && generatedDesign.public_id) {
    await deleteFromCloudinary(generatedDesign.public_id);
  }
  return await GeneratedDesign.findByIdAndDelete(id);
};

exports.cleanupOrphanedCloudinaryImages = async (cloudinaryList) => {
  // cloudinaryList: array of { public_id }
  // Find all public_ids in use
  const usedPublicIds = new Set();
  const allItems = await InventoryItem.find({ public_id: { $exists: true, $ne: null } });
  allItems.forEach(item => usedPublicIds.add(item.public_id));
  const allDesigns = await Design.find({ public_id: { $exists: true, $ne: null } });
  allDesigns.forEach(design => usedPublicIds.add(design.public_id));
  const allGenDesigns = await GeneratedDesign.find({ public_id: { $exists: true, $ne: null } });
  allGenDesigns.forEach(design => usedPublicIds.add(design.public_id));
  const allUsers = await User.find({ public_id: { $exists: true, $ne: null } });
  allUsers.forEach(user => usedPublicIds.add(user.public_id));

  // Delete Cloudinary images not referenced in DB
  const orphaned = cloudinaryList.filter(img => !usedPublicIds.has(img.public_id));
  for (const img of orphaned) {
    await deleteFromCloudinary(img.public_id);
  }
  return orphaned.length;
};
