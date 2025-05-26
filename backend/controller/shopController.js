const Shop = require("../model/shop");
const Product = require("../model/product");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

// Get popular shops based on number of products and ratings
exports.getPopularShops = catchAsyncErrors(async (req, res, next) => {
  const shops = await Shop.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "shopId",
        as: "products"
      }
    },
    {
      $addFields: {
        totalProducts: { $size: "$products" },
        averageRating: { $avg: "$products.ratings" }
      }
    },
    {
      $sort: { 
        totalProducts: -1,
        averageRating: -1
      }
    },
    {
      $limit: 10
    }
  ]);

  res.status(200).json({
    success: true,
    shops
  });
});

// Get latest shops
exports.getLatestShops = catchAsyncErrors(async (req, res, next) => {
  const shops = await Shop.find()
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    shops
  });
});

// Get shops with top offers
exports.getTopOfferShops = catchAsyncErrors(async (req, res, next) => {
  const shops = await Shop.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "shopId",
        as: "products"
      }
    },
    {
      $addFields: {
        discountedProducts: {
          $filter: {
            input: "$products",
            as: "product",
            cond: { $gt: ["$$product.originalPrice", "$$product.discountPrice"] }
          }
        }
      }
    },
    {
      $match: {
        "discountedProducts.0": { $exists: true }
      }
    },
    {
      $sort: { "discountedProducts": -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.status(200).json({
    success: true,
    shops
  });
});

// Get recommended shops based on user's location and preferences
exports.getRecommendedShops = catchAsyncErrors(async (req, res, next) => {
  const { latitude, longitude, radius = 10 } = req.query; // radius in kilometers

  if (!latitude || !longitude) {
    return next(new ErrorHandler("Please provide location coordinates", 400));
  }

  // Validate coordinates
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return next(new ErrorHandler("Invalid coordinates provided", 400));
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return next(new ErrorHandler("Coordinates out of valid range", 400));
  }

  const shops = await Shop.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat] // Correct order: [longitude, latitude]
        },
        $maxDistance: radius * 1000 // Convert to meters
      }
    }
  }).limit(10);

  res.status(200).json({
    success: true,
    shops
  });
});

// Get all stores with filters
exports.getAllStores = catchAsyncErrors(async (req, res, next) => {
  const { featured, offset = 0, limit = 50 } = req.query;
  
  // Build query
  const query = {};
  
  if (featured === '1') {
    query.featured = true;
  }

  // Calculate skip value for pagination
  const skip = parseInt(offset);
  const limitValue = parseInt(limit);

  // Execute query with sorting and pagination
  const shops = await Shop.find(query)
    .select('-password -resetPasswordToken -resetPasswordTime')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitValue);

  // Get total count for pagination
  const total = await Shop.countDocuments(query);

  res.status(200).json({
    success: true,
    shops,
    total,
    currentPage: Math.floor(skip / limitValue) + 1,
    totalPages: Math.ceil(total / limitValue)
  });
}); 