const express = require("express");
const router = express.Router();
const {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
  getBanner
} = require("../controller/adminBannerController");
const { isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");

// Create new banner
router.post("/create", isAdmin, upload.single("image"), createBanner);

// Get all banners
router.get("/all", getAllBanners);

// Get single banner
router.get("/:id", getBanner);

// Update banner
router.put("/:id", isAdmin, upload.single("image"), updateBanner);

// Delete banner
router.delete("/:id", isAdmin, deleteBanner);

module.exports = router; 