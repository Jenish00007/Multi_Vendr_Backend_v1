const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Product = require("../model/product");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Category = require("../model/Category");
const Subcategory = require("../model/Subcategory");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const mongoose = require("mongoose");

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// create product
router.post(
  "/create-product",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, category, subcategory } = req.body;
      
      // Validate shop ID
      if (!shopId || !isValidObjectId(shopId)) {
        return next(new ErrorHandler("Invalid shop ID format", 400));
      }

      // Validate category ID
      if (!category || !isValidObjectId(category)) {
        return next(new ErrorHandler("Invalid category ID format", 400));
      }

      // Validate subcategory ID
      if (!subcategory || !isValidObjectId(subcategory)) {
        return next(new ErrorHandler("Invalid subcategory ID format", 400));
      }

      // Check if shop exists
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop not found!", 404));
      }

      // Check if category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return next(new ErrorHandler("Category not found!", 404));
      }

      // Check if subcategory exists and belongs to the selected category
      const subcategoryExists = await Subcategory.findOne({
        _id: subcategory,
        category: category
      });
      if (!subcategoryExists) {
        return next(new ErrorHandler("Subcategory not found or does not belong to the selected category!", 404));
      }

      const files = req.files;
      const imageUrls = files.map((file) => file.location);

      const productData = req.body;
      productData.images = imageUrls;
      productData.shop = shop;

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all products of a shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.params.id;
      
      if (!shopId || !isValidObjectId(shopId)) {
        return next(new ErrorHandler("Invalid shop ID format", 400));
      }

      const products = await Product.find({ shopId })
        .populate('category', 'name')
        .populate('subcategory', 'name');

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// delete product of a shop
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;

      if (!productId || !isValidObjectId(productId)) {
        return next(new ErrorHandler("Invalid product ID format", 400));
      }

      const productData = await Product.findById(productId);
      
      if (!productData) {
        return next(new ErrorHandler("Product not found!", 404));
      }

      await Product.findByIdAndDelete(productId);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all products
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find()
        .populate('category', 'name')
        .populate('subcategory', 'name')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      if (!productId || !isValidObjectId(productId)) {
        return next(new ErrorHandler("Invalid product ID format", 400));
      }

      if (!orderId || !isValidObjectId(orderId)) {
        return next(new ErrorHandler("Invalid order ID format", 400));
      }

      const product = await Product.findById(productId);
      
      if (!product) {
        return next(new ErrorHandler("Product not found!", 404));
      }

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const isReviewed = product.reviews.find(
        (rev) => rev.user._id === req.user._id
      );

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            rev.rating = rating;
            rev.comment = comment;
            rev.user = user;
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;
      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      await Order.findByIdAndUpdate(
        orderId,
        { $set: { "cart.$[elem].isReviewed": true } },
        { arrayFilters: [{ "elem._id": productId }], new: true }
      );

      res.status(200).json({
        success: true,
        message: "Review submitted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// all products --- for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find()
        .populate('category', 'name')
        .populate('subcategory', 'name')
        .sort({
          createdAt: -1,
        });
      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
