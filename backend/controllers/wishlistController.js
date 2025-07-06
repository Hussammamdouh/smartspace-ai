const Wishlist = require('../models/Wishlist');
const InventoryItem = require('../models/InventoryItem');

// Get user's wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate('products.productId');

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, products: [] });
      await wishlist.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Wishlist retrieved successfully',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Validate product exists
    const product = await InventoryItem.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, products: [] });
    }

    // Check if product already in wishlist
    const existingProduct = wishlist.products.find(
      item => item.productId.toString() === productId
    );

    if (existingProduct) {
      return res.status(400).json({
        status: 'error',
        message: 'Product already in wishlist'
      });
    }

    wishlist.products.push({
      productId,
      addedAt: new Date()
    });

    await wishlist.save();
    await wishlist.populate('products.productId');

    res.status(200).json({
      status: 'success',
      message: 'Product added to wishlist successfully',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        status: 'error',
        message: 'Wishlist not found'
      });
    }

    const productIndex = wishlist.products.findIndex(
      item => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found in wishlist'
      });
    }

    wishlist.products.splice(productIndex, 1);
    await wishlist.save();
    await wishlist.populate('products.productId');

    res.status(200).json({
      status: 'success',
      message: 'Product removed from wishlist successfully',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        status: 'error',
        message: 'Wishlist not found'
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      status: 'success',
      message: 'Wishlist cleared successfully',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

// Move wishlist item to cart
exports.moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    // This will be handled by the cart controller
    // We'll just remove from wishlist and let the frontend add to cart
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        status: 'error',
        message: 'Wishlist not found'
      });
    }

    const productIndex = wishlist.products.findIndex(
      item => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found in wishlist'
      });
    }

    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    res.status(200).json({
      status: 'success',
      message: 'Product moved to cart successfully',
      data: { productId, quantity }
    });
  } catch (error) {
    next(error);
  }
}; 