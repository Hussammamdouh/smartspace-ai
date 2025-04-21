const Design = require('../models/Design');
const GeneratedDesign = require('../models/GeneratedDesign');
const DesignPreference = require('../models/DesignPreference');
const InventoryItem = require('../models/InventoryItem');
const aiImageService = require('../utils/aiImageService');
const paginate = require('../utils/paginate');

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
  return await Design.findByIdAndDelete(id);
};

exports.generateImageDesign = async (preferenceId, userId) => {
  const preferences = await DesignPreference.findById(preferenceId);
  if (!preferences) throw new Error('Preferences not found');

  const matchingItems = await InventoryItem.find({
    tags: { $in: [preferences.style, preferences.roomType] }
  }).limit(10);

  const imageUrl = await aiImageService.generateRoomImage(preferences, matchingItems);

  const generatedDesign = await GeneratedDesign.create({
    user: userId,
    preference: preferences._id,
    imageUrl,
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
