const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated } = require("../middleware/auth");
const Shop = require("../model/shop");
const Product = require("../model/product");
const { getDeliveryAvailability } = require("../config/deliveryRadius");

// Check delivery availability for a specific location
router.get(
  "/check-availability",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { latitude, longitude, shopId } = req.query;

      // Validate required parameters
      if (!latitude || !longitude) {
        return next(new ErrorHandler("Latitude and longitude are required", 400));
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

      let shops = [];
      
      if (shopId) {
        // Check specific shop
        const shop = await Shop.findById(shopId);
        if (!shop) {
          return next(new ErrorHandler("Shop not found", 404));
        }
        shops = [shop];
      } else {
        // Get all active shops
        shops = await Shop.find({}).limit(20); // Limit for performance
      }

      const availabilityResults = [];

      for (const shop of shops) {
        const availability = getDeliveryAvailability(lat, lng, shop);
        
        availabilityResults.push({
          shopId: shop._id,
          shopName: shop.name,
          available: availability.available,
          message: availability.message,
          distance: availability.distance,
          reason: availability.reason,
          shopLocation: shop.location
        });
      }

      res.status(200).json({
        success: true,
        userLocation: { latitude: lat, longitude: lng },
        availability: availabilityResults,
        totalShops: availabilityResults.length,
        availableShops: availabilityResults.filter(result => result.available).length
      });

    } catch (error) {
      console.error("Delivery availability check error:", error);
      return next(new ErrorHandler("Error checking delivery availability", 500));
    }
  })
);

// Get products available for delivery at a location
router.get(
  "/available-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { latitude, longitude, categoryId, limit = 20, offset = 0 } = req.query;

      // Validate required parameters
      if (!latitude || !longitude) {
        return next(new ErrorHandler("Latitude and longitude are required", 400));
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

      // Get all shops and check delivery availability
      const shops = await Shop.find({});
      const availableShops = [];

      for (const shop of shops) {
        const availability = getDeliveryAvailability(lat, lng, shop);
        if (availability.available) {
          availableShops.push({
            shopId: shop._id,
            shopName: shop.name,
            distance: availability.distance,
            message: availability.message
          });
        }
      }

      // Get products from available shops only
      const availableShopIds = availableShops.map(shop => shop.shopId);
      
      let productQuery = {
        shopId: { $in: availableShopIds },
        isActive: true
      };

      if (categoryId) {
        productQuery.categoryId = categoryId;
      }

      const products = await Product.find(productQuery)
        .populate('shopId', 'name location')
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ createdAt: -1 });

      // Add delivery info to each product
      const productsWithDeliveryInfo = products.map(product => {
        const shopInfo = availableShops.find(shop => shop.shopId.toString() === product.shopId._id.toString());
        return {
          ...product.toObject(),
          deliveryInfo: {
            available: true,
            distance: shopInfo.distance,
            message: shopInfo.message
          }
        };
      });

      res.status(200).json({
        success: true,
        userLocation: { latitude: lat, longitude: lng },
        availableShops: availableShops.length,
        products: productsWithDeliveryInfo,
        totalProducts: productsWithDeliveryInfo.length,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });

    } catch (error) {
      console.error("Available products check error:", error);
      return next(new ErrorHandler("Error fetching available products", 500));
    }
  })
);

// Check if a specific product is available for delivery
router.get(
  "/product-availability/:productId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { latitude, longitude } = req.query;

      // Validate required parameters
      if (!latitude || !longitude) {
        return next(new ErrorHandler("Latitude and longitude are required", 400));
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

      // Get product with shop information
      const product = await Product.findById(productId).populate('shopId', 'name location');
      
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      // Check delivery availability
      const availability = getDeliveryAvailability(lat, lng, product.shopId);

      res.status(200).json({
        success: true,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          shopName: product.shopId.name
        },
        userLocation: { latitude: lat, longitude: lng },
        delivery: {
          available: availability.available,
          message: availability.message,
          distance: availability.distance,
          reason: availability.reason
        }
      });

    } catch (error) {
      console.error("Product availability check error:", error);
      return next(new ErrorHandler("Error checking product availability", 500));
    }
  })
);

module.exports = router;
