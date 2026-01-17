const Product = require("../model/product");
const Shop = require("../model/shop");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

/**
 * Helper to normalize district strings (case-insensitive, trimmed)
 */
const normalizeDistrict = (value = "") => {
  const normalized = value.toString().trim().toLowerCase();
  // Handle district name variations: tirupathur -> tirupattur
  if (normalized === 'tirupathur') {
    return 'tirupattur';
  }
  return normalized;
};

/**
 * Resolve a shopId (Mongo _id) from a given district string.
 * We resolve dynamically from the Shop collection so new shops work automatically.
 * Strategy:
 *  - Try to find a shop where name or address contains the district string (case-insensitive)
 */
const resolveShopMongoIdByDistrict = async (districtRaw) => {
  if (!districtRaw) return null;

  const district = normalizeDistrict(districtRaw);

  // Best-effort match on shop name or address using the raw district string
  const regex = new RegExp(districtRaw, "i");
  const fallbackShop = await Shop.findOne({
    $or: [{ name: regex }, { address: regex }],
  }).select("_id");

  return fallbackShop ? fallbackShop._id.toString() : null;
};

/**
 * Extract a "district-like" string from a geocoding response (Nominatim or similar).
 * Accepts either:
 *  - address object (Nominatim: data.address)
 *  - flat fields like { city_district, district, county, state_district, state }
 */
const extractDistrictFromAddress = (address = {}) => {
  return (
    address.city_district ||
    address.district ||
    address.county ||
    address.state_district ||
    address.city ||
    address.town ||
    address.village ||
    ""
  );
};

/**
 * Helper to determine section from route path
 */
const getSectionFromRoute = (req) => {
  const path = req.route.path;
  
  if (path.includes('recommended-by-location')) return 'recommended';
  if (path.includes('top-offers-by-location')) return 'offers';
  if (path.includes('popular-by-location')) return 'popular';
  if (path.includes('latest-by-location')) return 'latest';
  
  // Fallback to query parameter for by-location route
  return req.query.section || 'popular';
};

/**
 * Helper to remove duplicate products based on _id, name, and shop
 */
const removeDuplicates = (products) => {
  const seen = new Set();
  return products.filter(product => {
    if (!product || !product._id) {
      return false; // Filter out invalid products
    }
    
    // Create a unique key based on product name, shopId, and price to catch true duplicates
    const uniqueKey = `${product.name}_${product.shopId}_${product.originalPrice}_${product.discountPrice}`.toLowerCase();
    
    if (seen.has(uniqueKey)) {
      return false;
    }
    seen.add(uniqueKey);
    return true;
  });
};

/**
 * New endpoint: get sectioned products by district or coordinates.
 * Does NOT modify any existing /user-products routes.
 *
 * Query params:
 *  - section: 'popular' | 'offers' | 'recommended' | 'latest' | 'all' (default: 'popular', only used for /by-location route)
 *  - district: optional district string (highest priority)
 *  - lat, lon: optional coordinates for future enhancements
 *  - page, limit: pagination controls
 */
exports.getProductsByLocationSection = catchAsyncErrors(
  async (req, res, next) => {
    try {
      // Determine section from route path or query parameter
      const section = getSectionFromRoute(req);
      const {
        district,
        lat,
        lon,
        page = 1,
        limit = 10,
      } = req.query;

      // 1) Resolve district → shop Mongo _id
      let resolvedDistrict = normalizeDistrict(district);
      console.log("district", district);
      // In future we could derive district from lat/lon via a geocoding service.
      // For now we rely on district string from client.
      if (!resolvedDistrict && !lat && !lon) {
        return res.status(200).json({
          success: true,
          products: [],
          total: 0,
          currentPage: parseInt(page),
          totalPages: 0,
          hasMore: false,
          message: "district or coordinates are required to resolve shop location",
        });
      }

      const shopMongoId = await resolveShopMongoIdByDistrict(resolvedDistrict);
      console.log("shopMongoId", shopMongoId);
      if (!shopMongoId) {
        return res.status(200).json({
          success: true,
          products: [],
          total: 0,
          currentPage: parseInt(page),
          totalPages: 0,
          hasMore: false,
          message: "No shop configured for this district",
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitValue = parseInt(limit);

      let products = [];
      let total = 0;

      if (section === "latest") {
        // Latest products for this shop
        const query = { shopId: shopMongoId };

        // Use aggregation to handle deduplication before pagination
        const pipeline = [
          { $match: query },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: {
                name: "$name",
                shopId: "$shopId",
                originalPrice: "$originalPrice",
                discountPrice: "$discountPrice"
              },
              product: { $first: "$$ROOT" }
            }
          },
          { $replaceRoot: { newRoot: "$product" } },
          {
            $facet: {
              products: [{ $skip: skip }, { $limit: limitValue }],
              totalCount: [{ $count: "count" }]
            }
          }
        ];

        const result = await Product.aggregate(pipeline);
        products = result[0]?.products || [];
        total = result[0]?.totalCount[0]?.count || 0;

        // Populate category and subcategory
        products = await Product.populate(products, [
          { path: "category", select: "name" },
          { path: "subcategory", select: "name" }
        ]);
      } else if (section === "recommended") {
        // Recommended: highest rated in this shop
        const query = { shopId: shopMongoId };

        products = await Product.find(query)
          .populate("category", "name")
          .populate("subcategory", "name")
          .sort({ ratings: -1, sold_out: -1 })
          .skip(skip)
          .limit(limitValue);

        total = await Product.countDocuments(query);
      } else if (section === "offers") {
        // Top offers: highest discount for this shop
        const pipeline = [
          {
            $match: {
              shopId: shopMongoId,
              originalPrice: { $exists: true, $ne: null },
              discountPrice: { $exists: true, $ne: null },
            },
          },
          {
            $addFields: {
              discountPercentage: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$originalPrice", "$discountPrice"] },
                      "$originalPrice",
                    ],
                  },
                  100,
                ],
              },
            },
          },
          {
            $sort: { discountPercentage: -1 },
          },
          {
            $facet: {
              products: [{ $skip: skip }, { $limit: limitValue }],
              totalCount: [{ $count: "count" }],
            },
          },
        ];

        const result = await Product.aggregate(pipeline);
        const rawProducts = result[0]?.products || [];
        total = result[0]?.totalCount[0]?.count || 0;

        products = await Product.populate(rawProducts, [
          { path: "category", select: "name" },
          { path: "subcategory", select: "name" },
        ]);
      } else if (section === "all") {
        // All products for this shop (no specific sorting)
        const query = { shopId: shopMongoId };

        // Use aggregation to handle deduplication before pagination
        const pipeline = [
          { $match: query },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: {
                name: "$name",
                shopId: "$shopId",
                originalPrice: "$originalPrice",
                discountPrice: "$discountPrice"
              },
              product: { $first: "$$ROOT" }
            }
          },
          { $replaceRoot: { newRoot: "$product" } },
          {
            $facet: {
              products: [{ $skip: skip }, { $limit: limitValue }],
              totalCount: [{ $count: "count" }]
            }
          }
        ];

        const result = await Product.aggregate(pipeline);
        products = result[0]?.products || [];
        total = result[0]?.totalCount[0]?.count || 0;

        // Populate category and subcategory
        products = await Product.populate(products, [
          { path: "category", select: "name" },
          { path: "subcategory", select: "name" }
        ]);
      } else {
        // Default: popular items for this shop
        const query = { shopId: shopMongoId };

        products = await Product.find(query)
          .populate("category", "name")
          .populate("subcategory", "name")
          .sort({ sold_out: -1, ratings: -1 })
          .skip(skip)
          .limit(limitValue);

        total = await Product.countDocuments(query);
      }

      // Remove duplicate products (only for sections other than "all" which handles it in aggregation)
      const uniqueProducts = section === "all" ? products : removeDuplicates(products);

      res.status(200).json({
        success: true,
        products: uniqueProducts,
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitValue),
        hasMore: skip + limitValue < total,
        shopId: shopMongoId,
        section,
        district: resolvedDistrict,
      });
    } catch (error) {
      console.error("Error in getProductsByLocationSection:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);
