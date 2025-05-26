const Product = require("../model/product");
const Event = require("../model/event");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const mongoose = require("mongoose");

// Get recommended products
exports.getRecommendedProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find()
    .sort({ ratings: -1, sold_out: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    products,
  });
});

// Get top offers (products with highest discount)
exports.getTopOffers = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.aggregate([
    {
      $match: {
        originalPrice: { $exists: true, $ne: null },
        discountPrice: { $exists: true, $ne: null }
      }
    },
    {
      $addFields: {
        discountPercentage: {
          $multiply: [
            {
              $divide: [
                { $subtract: ["$originalPrice", "$discountPrice"] },
                "$originalPrice"
              ]
            },
            100
          ]
        }
      }
    },
    {
      $sort: { discountPercentage: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.status(200).json({
    success: true,
    products,
  });
});

// Get most popular items (based on sold_out and ratings)
exports.getMostPopularItems = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find()
    .sort({ sold_out: -1, ratings: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    products,
  });
});

// Get latest items
exports.getLatestItems = catchAsyncErrors(async (req, res, next) => {
  try {
    const { store_id, category_id, offset = 0, limit = 10, type = 'all' } = req.query;
    
    // Build query
    const query = {};
    
    if (store_id && store_id !== '0') {
      // Validate if store_id is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(store_id)) {
        return next(new ErrorHandler("Invalid store ID format", 400));
      }
      query.shopId = store_id;
    }
    
    if (category_id && category_id !== '0') {
      query.category = category_id;
    }
    
    if (type !== 'all') {
      query.type = type;
    }

    // Calculate skip value for pagination
    const skip = parseInt(offset);
    const limitValue = parseInt(limit);

    // Execute query with sorting and pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitValue)
      .populate('shopId', 'name avatar ratings'); // Populate shop details

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      total,
      currentPage: Math.floor(skip / limitValue) + 1,
      totalPages: Math.ceil(total / limitValue)
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get flash sale items (from events collection)
exports.getFlashSaleItems = catchAsyncErrors(async (req, res, next) => {
  const currentDate = new Date();
  
  const flashSaleItems = await Event.find({
    start_Date: { $lte: currentDate },
    Finish_Date: { $gte: currentDate },
    status: "Running",
  }).limit(10);

  res.status(200).json({
    success: true,
    flashSaleItems,
  });
}); 