const { getDeliveryAvailability } = require('../config/deliveryRadius');
const Shop = require('../model/shop');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Middleware to validate delivery radius for orders
 */
const validateDeliveryRadius = async (req, res, next) => {
  try {
    const { userLocation, cart } = req.body;

    // Check if user location is provided
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return next(new ErrorHandler("User location is required for delivery validation", 400));
    }

    const { latitude, longitude } = userLocation;

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return next(new ErrorHandler("Invalid location coordinates", 400));
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return next(new ErrorHandler("Coordinates out of valid range", 400));
    }

    // Get unique shop IDs from cart
    const shopIds = [...new Set(cart.map(item => item.shopId))];
    
    // Check delivery availability for each shop
    const deliveryChecks = [];
    const unavailableShops = [];

    for (const shopId of shopIds) {
      try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
          return next(new ErrorHandler(`Shop with ID ${shopId} not found`, 404));
        }

        const availability = getDeliveryAvailability(latitude, longitude, shop);
        
        deliveryChecks.push({
          shopId,
          shopName: shop.name,
          available: availability.available,
          message: availability.message,
          distance: availability.distance,
          reason: availability.reason
        });

        if (!availability.available) {
          unavailableShops.push({
            shopId,
            shopName: shop.name,
            reason: availability.reason,
            message: availability.message
          });
        }
      } catch (error) {
        console.error(`Error checking delivery for shop ${shopId}:`, error);
        return next(new ErrorHandler(`Error validating delivery for shop ${shopId}`, 500));
      }
    }

    // If any shops are unavailable, return error with details
    if (unavailableShops.length > 0) {
      const errorMessage = unavailableShops.map(shop => 
        `${shop.shopName}: ${shop.message}`
      ).join('; ');
      
      return res.status(400).json({
        success: false,
        message: "Some items are not available for delivery to your location",
        unavailableShops,
        deliveryChecks,
        error: errorMessage
      });
    }

    // Add delivery validation results to request for logging
    req.deliveryValidation = {
      userLocation: { latitude, longitude },
      deliveryChecks,
      allAvailable: true
    };

    next();
  } catch (error) {
    console.error('Delivery validation error:', error);
    return next(new ErrorHandler("Error validating delivery radius", 500));
  }
};

/**
 * Middleware to check delivery availability for a single shop
 */
const validateSingleShopDelivery = async (req, res, next) => {
  try {
    const { userLocation, shopId } = req.body;

    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return next(new ErrorHandler("User location is required", 400));
    }

    if (!shopId) {
      return next(new ErrorHandler("Shop ID is required", 400));
    }

    const { latitude, longitude } = userLocation;

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return next(new ErrorHandler("Invalid location coordinates", 400));
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return next(new ErrorHandler("Shop not found", 404));
    }

    const availability = getDeliveryAvailability(latitude, longitude, shop);

    if (!availability.available) {
      return res.status(400).json({
        success: false,
        message: availability.message,
        shopName: shop.name,
        distance: availability.distance,
        reason: availability.reason
      });
    }

    // Add delivery info to request
    req.deliveryInfo = {
      shopName: shop.name,
      distance: availability.distance,
      message: availability.message
    };

    next();
  } catch (error) {
    console.error('Single shop delivery validation error:', error);
    return next(new ErrorHandler("Error validating shop delivery", 500));
  }
};

module.exports = {
  validateDeliveryRadius,
  validateSingleShopDelivery
};
