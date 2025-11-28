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

module.exports = router; 