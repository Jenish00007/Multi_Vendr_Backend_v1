const AdminBanner = require("../model/adminBanner");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");
const path = require("path");

// Create new banner
exports.createBanner = catchAsyncErrors(async (req, res, next) => {
  try {
    const { title, description, link, order } = req.body;

    if (!req.file) {
      return next(new ErrorHandler("Please upload a banner image", 400));
    }

    const banner = await AdminBanner.create({
      title,
      description,
      image: req.file.filename,
      link,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      banner
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Get all banners
exports.getAllBanners = catchAsyncErrors(async (req, res, next) => {
  const banners = await AdminBanner.find()
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    banners
  });
});

// Update banner
exports.updateBanner = catchAsyncErrors(async (req, res, next) => {
  try {
    const { title, description, link, order, isActive } = req.body;
    const bannerId = req.params.id;

    const banner = await AdminBanner.findById(bannerId);

    if (!banner) {
      return next(new ErrorHandler("Banner not found", 404));
    }

    // If new image is uploaded
    if (req.file) {
      // Delete old image
      const oldImagePath = path.join(__dirname, "../uploads", banner.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      banner.image = req.file.filename;
    }

    banner.title = title || banner.title;
    banner.description = description || banner.description;
    banner.link = link || banner.link;
    banner.order = order !== undefined ? order : banner.order;
    banner.isActive = isActive !== undefined ? isActive : banner.isActive;
    banner.updatedAt = Date.now();

    await banner.save();

    res.status(200).json({
      success: true,
      banner
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Delete banner
exports.deleteBanner = catchAsyncErrors(async (req, res, next) => {
  const bannerId = req.params.id;

  const banner = await AdminBanner.findById(bannerId);

  if (!banner) {
    return next(new ErrorHandler("Banner not found", 404));
  }

  // Delete image file
  const imagePath = path.join(__dirname, "../uploads", banner.image);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  await banner.deleteOne();

  res.status(200).json({
    success: true,
    message: "Banner deleted successfully"
  });
});

// Get single banner
exports.getBanner = catchAsyncErrors(async (req, res, next) => {
  const bannerId = req.params.id;

  const banner = await AdminBanner.findById(bannerId);

  if (!banner) {
    return next(new ErrorHandler("Banner not found", 404));
  }

  res.status(200).json({
    success: true,
    banner
  });
}); 