const Notification = require("../model/notification");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

// Get all notifications for a user
router.get(
  "/notifications",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("orderId", "orderNumber status")
        .populate("shopId", "name avatar");

      const total = await Notification.countDocuments({ user: req.user._id });
      const unreadCount = await Notification.countDocuments({ 
        user: req.user._id, 
        isRead: false 
      });

      res.status(200).json({
        success: true,
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          unreadCount,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Mark notification as read
router.put(
  "/notifications/:id/read",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Mark all notifications as read
router.put(
  "/notifications/read-all",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
      );

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete a notification
router.delete(
  "/notifications/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete all notifications
router.delete(
  "/notifications",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      await Notification.deleteMany({ user: req.user._id });

      res.status(200).json({
        success: true,
        message: "All notifications deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get unread notification count
router.get(
  "/notifications/unread-count",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const unreadCount = await Notification.countDocuments({
        user: req.user._id,
        isRead: false,
      });

      res.status(200).json({
        success: true,
        unreadCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create notification (for internal use - admin/shop)
router.post(
  "/create-notification",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId, title, description, type, data, orderId, shopId } = req.body;

      if (!userId || !title || !description) {
        return next(new ErrorHandler("Missing required fields", 400));
      }

      const notification = await Notification.create({
        user: userId,
        title,
        description,
        type: type || "general",
        data: data || {},
        orderId,
        shopId,
      });

      res.status(201).json({
        success: true,
        notification,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router; 