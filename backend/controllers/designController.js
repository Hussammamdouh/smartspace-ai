const designService = require('../services/designService');
const DesignPreference = require('../models/DesignPreference');
const GeneratedDesign = require('../models/GeneratedDesign');
const Design = require('../models/Design');

exports.getDesigns = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await designService.getUserDesigns(req.user.id, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getDesign = async (req, res, next) => {
  try {
    const design = await GeneratedDesign.findById(req.params.id)
      .populate('preference')
      .populate('relatedProducts');
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    if (design.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to access this design' });
    }
    
    res.status(200).json({ design });
  } catch (error) {
    next(error);
  }
};

exports.createDesign = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      user: req.user.id,
    };
    const design = await designService.createDesign(data);
    res.status(201).json(design);
  } catch (error) {
    next(error);
  }
};

exports.deleteDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
if (!design || design.userId.toString() !== req.user.id.toString()) {
  return res.status(403).json({ message: 'Unauthorized to delete this design' });
}
await Design.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Design deleted' });
  } catch (error) {
    next(error);
  }
};

exports.savePreferences = async (req, res, next) => {
  try {
    const { roomType, style, colorPalette, budget, dimensions, additionalNotes } = req.body;

    const preference = await DesignPreference.create({
      user: req.user.id,
      roomType,
      style,
      colorPalette,
      budget,
      dimensions,
      additionalNotes,
    });

    res.status(201).json({ success: true, preference });
  } catch (err) {
    next(err);
  }
};

exports.generateDesign = async (req, res, next) => {
  try {
    const { preferenceId } = req.body;
    const design = await designService.generateImageDesign(preferenceId, req.user.id);
    res.status(201).json({ success: true, design });
  } catch (err) {
    next(err);
  }
};

exports.getGeneratedDesigns = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, style, roomType, startDate, endDate } = req.query;

    const query = { user: userId };

    if (style) query['preference.style'] = style;
    if (roomType) query['preference.roomType'] = roomType;

    const preferenceMatch = {};
    if (style) preferenceMatch.style = style;
    if (roomType) preferenceMatch.roomType = roomType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await GeneratedDesign.countDocuments(query);
    const designs = await GeneratedDesign.find(query)
      .populate({
        path: 'preference',
        match: preferenceMatch,
      })
      .populate('relatedProducts')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const filteredDesigns = designs.filter(d => d.preference); // Remove null preferences

    res.status(200).json({
      success: true,
      data: filteredDesigns,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: filteredDesigns.length,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
