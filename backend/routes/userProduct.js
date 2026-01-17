const express = require("express");
const router = express.Router();
const {
  getRecommendedProducts,
  getTopOffers,
  getMostPopularItems,
  getLatestItems,
  getFlashSaleItems,
} = require("../controller/userProductController");
const {
  getProductsByLocationSection,
} = require("../controller/locationProductController");

// Get recommended products
router.get("/recommended", getRecommendedProducts);

// Get top offers
router.get("/top-offers", getTopOffers);

// Get most popular items
router.get("/popular", getMostPopularItems);

// Get latest items
router.get("/latest", getLatestItems);

// Get flash sale items
router.get("/flash-sale", getFlashSaleItems);

// NEW: Get sectioned products filtered by district/location
// Example:
//  GET /v2/user-products/by-location?section=popular&district=Krishnagiri&page=1&limit=10
router.get("/by-location", getProductsByLocationSection);

// NEW: Location-based routes for each section
// Get recommended products by district/location
// Example: GET /v2/user-products/recommended-by-location?district=Krishnagiri&page=1&limit=10
router.get("/recommended-by-location", getProductsByLocationSection);

// Get top offers by district/location  
// Example: GET /v2/user-products/top-offers-by-location?district=Krishnagiri&page=1&limit=10
router.get("/top-offers-by-location", getProductsByLocationSection);

// Get most popular items by district/location
// Example: GET /v2/user-products/popular-by-location?district=Krishnagiri&page=1&limit=10
router.get("/popular-by-location", getProductsByLocationSection);

// Get latest products by district/location
// Example: GET /v2/user-products/latest-by-location?district=Krishnagiri&page=1&limit=10
router.get("/latest-by-location", getProductsByLocationSection);

module.exports = router;
