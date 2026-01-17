const express = require("express");
const router = express.Router();
const { getProductsByLocationSection } = require("../controller/locationProductController");

// Get products by location and section
// Query params: section, district, lat, lon, page, limit
router.get("/section", getProductsByLocationSection);

module.exports = router;
