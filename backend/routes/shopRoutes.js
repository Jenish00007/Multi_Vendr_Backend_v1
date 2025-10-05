const express = require("express");
const router = express.Router();
const {
  getPopularShops,
  getLatestShops,
  getTopOfferShops,
  getRecommendedShops,
  getAllStores,
  updateExpoPushToken
} = require("../controller/shopController");
const { isSeller } = require("../middleware/auth");

// Get popular shops
router.get("/popular", getPopularShops);

// Get latest shops
router.get("/latest", getLatestShops);

// Get shops with top offers
router.get("/top-offers", getTopOfferShops);

// Get all stores with filters
router.get("/all", getAllStores);

// Get recommended shops near me
router.get("/recommended", getRecommendedShops);

// Update Expo push notification token for shop
router.put("/expo-push-token", isSeller, updateExpoPushToken);

module.exports = router;