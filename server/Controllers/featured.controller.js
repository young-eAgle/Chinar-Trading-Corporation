import asyncHandler from 'express-async-handler';
import Featured from '../models/model.featured.js';
import Product from '../models/model.product.js';

// @desc    Get featured products
// @route   GET /api/home/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    console.log('📦 Fetching featured products...');
    const featuredItems = await Featured.find({
      type: 'featured',
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
    .populate({
      path: 'productId',
      select: 'name brand price actualPrice imageUrl available categoryId subcategoryId'
    })
    .sort({ priority: -1, createdAt: -1 })
    .limit(4);

    if (!featuredItems.length) {
      console.log('⚠️ No featured products found');
      return res.status(404).json({ message: "No featured products found" });
    }

    const featuredProducts = featuredItems.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      brand: item.productId.brand,
      price: item.productId.price,
      actualPrice: item.productId.actualPrice,
      imageUrl: item.productId.imageUrl,
      available: item.productId.available,
      categoryId: item.productId.categoryId,
      subcategoryId: item.productId.subcategoryId,
      featuredId: item._id,
      discount: item.discount,
      description: item.description,
      bannerImage: item.bannerImage,
      startDate: item.startDate,
      endDate: item.endDate
    }));

    console.log(`✅ Successfully fetched ${featuredProducts.length} featured products`);
    res.json(featuredProducts);
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    res.status(500).json({
      error: "Failed to fetch featured products",
      details: error.message
    });
  }
});

// @desc    Get special offers
// @route   GET /api/home/special-offers
// @access  Public
export const getSpecialOffers = asyncHandler(async (req, res) => {
  try {
    console.log('📦 Fetching special offers...');
    const specialOffers = await Featured.find({
      type: 'special_offer',
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
    .populate({
      path: 'productId',
      select: 'name brand price actualPrice imageUrl available categoryId subcategoryId'
    })
    .sort({ priority: -1, createdAt: -1 })
    .limit(4);

    if (!specialOffers.length) {
      console.log('⚠️ No special offers found');
      return res.status(404).json({ message: "No special offers found" });
    }

    const offers = specialOffers.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      brand: item.productId.brand,
      price: item.productId.price,
      actualPrice: item.productId.actualPrice,
      imageUrl: item.productId.imageUrl,
      available: item.productId.available,
      categoryId: item.productId.categoryId,
      subcategoryId: item.productId.subcategoryId,
      featuredId: item._id,
      discount: item.discount,
      description: item.description,
      bannerImage: item.bannerImage,
      startDate: item.startDate,
      endDate: item.endDate,
      discountedPrice: item.productId.actualPrice * (1 - item.discount / 100)
    }));

    console.log(`✅ Successfully fetched ${offers.length} special offers`);
    res.json(offers);
  } catch (error) {
    console.error('❌ Error fetching special offers:', error);
    res.status(500).json({
      error: "Failed to fetch special offers",
      details: error.message
    });
  }
});

// @desc    Add featured product or special offer
// @route   POST /api/admin/featured
// @access  Private/Admin
export const addFeatured = asyncHandler(async (req, res) => {
  try {
    const { productId, type, startDate, endDate, discount, description, bannerImage, priority } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const featured = await Featured.create({
      productId,
      type,
      startDate,
      endDate,
      discount,
      description,
      bannerImage,
      priority,
      isActive: true
    });

    res.status(201).json(featured);
  } catch (error) {
    console.error('❌ Error adding featured item:', error);
    res.status(500).json({
      error: "Failed to add featured item",
      details: error.message
    });
  }
});

// @desc    Update featured product or special offer
// @route   PUT /api/admin/featured/:id
// @access  Private/Admin
export const updateFeatured = asyncHandler(async (req, res) => {
  try {
    const featured = await Featured.findById(req.params.id);

    if (!featured) {
      res.status(404);
      throw new Error('Featured item not found');
    }

    Object.assign(featured, req.body);
    await featured.save();

    res.json(featured);
  } catch (error) {
    console.error('❌ Error updating featured item:', error);
    res.status(500).json({
      error: "Failed to update featured item",
      details: error.message
    });
  }
});

// @desc    Delete featured product or special offer
// @route   DELETE /api/admin/featured/:id
// @access  Private/Admin
export const deleteFeatured = asyncHandler(async (req, res) => {
  try {
    const featured = await Featured.findById(req.params.id);

    if (!featured) {
      res.status(404);
      throw new Error('Featured item not found');
    }

    await featured.deleteOne();
    res.json({ message: 'Featured item removed' });
  } catch (error) {
    console.error('❌ Error deleting featured item:', error);
    res.status(500).json({
      error: "Failed to delete featured item",
      details: error.message
    });
  }
}); 