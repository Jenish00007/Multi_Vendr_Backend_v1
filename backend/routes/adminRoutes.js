const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../model/user");
const Shop = require("../model/shop");
const Order = require("../model/order");
const Product = require("../model/product");
const { getDeliveryManPreview } = require("../controller/deliveryman");
const { upload } = require("../multer");

// Get dashboard stats
router.get("/dashboard-stats", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(async (req, res, next) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ role: { $ne: "Admin" } }); // Exclude admin users
    const totalStores = await Shop.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total items sold (sum of all quantities from all orders)
    const totalItemsResult = await Order.aggregate([
      {
        $unwind: "$cart"
      },
      {
        $group: {
          _id: null,
          totalItems: { 
            $sum: { 
              $ifNull: ["$cart.quantity", 0] 
            } 
          }
        }
      }
    ]);
    const totalItems = totalItemsResult[0]?.totalItems || 0;

    // Calculate total earnings (10% commission from delivered orders)
    const earningsResult = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = earningsResult[0]?.total || 0;
    const totalEarnings = totalRevenue * 0.1; // 10% admin commission

    // Order status counts
    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object for easier access
    const statusCounts = {};
    orderStatusCounts.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      totalUsers,
      totalStores,
      totalProducts,
      totalItems,
      totalOrders,
      totalEarnings,
      totalRevenue,
      orderStatusCounts: {
        unassigned: statusCounts["Unassigned"] || 0,
        accepted: statusCounts["Accepted"] || 0,
        packaging: statusCounts["Packaging"] || 0,
        outForDelivery: statusCounts["Out For Delivery"] || 0,
        delivered: statusCounts["Delivered"] || 0,
        canceled: statusCounts["Canceled"] || statusCounts["Cancelled"] || 0,
        refunded: statusCounts["Refunded"] || 0,
        paymentFailed: statusCounts["Payment Failed"] || 0,
        processing: statusCounts["Processing"] || 0,
        pending: statusCounts["Pending"] || 0
      }
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get all users
router.get("/users", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get all sellers
router.get("/sellers", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(async (req, res, next) => {
  try {
    const sellers = await Shop.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      sellers
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get all products
router.get("/products", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate("shop", "name")
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Delete product
router.delete("/product/:id", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    await product.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get delivery man preview
router.get("/delivery-man/:id", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(getDeliveryManPreview));

// Create seller (admin only)
router.post("/seller/create", isAuthenticated, isAdmin("Admin"), upload.single("shopAvatar"), catchAsyncErrors(async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });

    if (sellerEmail) {
      return next(new ErrorHandler("Seller with this email already exists", 400));
    }

    // Check app type to conditionally include withdraw-related fields
    const Configuration = require("../model/Configuration");
    const configuration = await Configuration.findOne({ isActive: true });
    
    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: req.file ? req.file.location : (req.body.avatar || "https://your-default-avatar-url.com/default-avatar.jpg"),
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
      description: req.body.description || "",
      location: {
        type: 'Point',
        coordinates: req.body.longitude && req.body.latitude ? [parseFloat(req.body.longitude), parseFloat(req.body.latitude)] : [0, 0]
      }
    };
    
    // Only include withdraw-related fields if app type is multivendor
    if (configuration && configuration.appType === 'multivendor') {
      seller.withdrawMethod = req.body.withdrawMethod || null;
    }

    // Create shop directly without activation
    const newSeller = await Shop.create(seller);
    
    res.status(201).json({
      success: true,
      message: "Seller created successfully",
      seller: newSeller
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}));

// Update seller (admin only)
router.put("/seller/update/:id", isAuthenticated, isAdmin("Admin"), upload.single("shopAvatar"), catchAsyncErrors(async (req, res, next) => {
  try {
    const seller = await Shop.findById(req.params.id);

    if (!seller) {
      return next(new ErrorHandler("Seller not found", 404));
    }

    // Update fields
    if (req.body.name !== undefined) seller.name = req.body.name;
    if (req.body.email !== undefined) {
      // Check if email is already taken by another seller
      const existingSeller = await Shop.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
      if (existingSeller) {
        return next(new ErrorHandler("Email already taken by another seller", 400));
      }
      seller.email = req.body.email;
    }
    if (req.body.password !== undefined && req.body.password !== "") {
      seller.password = req.body.password;
    }
    if (req.body.phoneNumber !== undefined) seller.phoneNumber = req.body.phoneNumber;
    if (req.body.address !== undefined) seller.address = req.body.address;
    if (req.body.zipCode !== undefined) seller.zipCode = req.body.zipCode;
    if (req.body.description !== undefined) seller.description = req.body.description;
    
    // Handle avatar update - prioritize file upload over body parameter
    if (req.file) {
      seller.avatar = req.file.location;
    } else if (req.body.avatar !== undefined) {
      seller.avatar = req.body.avatar;
    }
    
    if (req.body.featured !== undefined) seller.featured = req.body.featured === 'true' || req.body.featured === true;
    
    // Update location if provided
    if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
      seller.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
      };
    }

    // Update business hours if provided
    if (req.body.businessHours) {
      seller.businessHours = req.body.businessHours;
    }

    // Check app type to conditionally update withdraw-related fields
    const Configuration = require("../model/Configuration");
    const configuration = await Configuration.findOne({ isActive: true });
    
    if (configuration && configuration.appType === 'multivendor' && req.body.withdrawMethod !== undefined) {
      seller.withdrawMethod = req.body.withdrawMethod;
    }

    await seller.save();

    res.status(200).json({
      success: true,
      message: "Seller updated successfully",
      seller
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get single seller by ID (admin only)
router.get("/seller/:id", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(async (req, res, next) => {
  try {
    const seller = await Shop.findById(req.params.id).select("-password");

    if (!seller) {
      return next(new ErrorHandler("Seller not found", 404));
    }

    res.status(200).json({
      success: true,
      seller
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

module.exports = router; 