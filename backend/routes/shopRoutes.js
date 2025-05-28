const express = require("express");
const router = express.Router();
const {
  getPopularShops,
  getLatestShops,
  getTopOfferShops,
  getRecommendedShops,
  getAllStores
} = require("../controller/shopController");

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

module.exports = router;