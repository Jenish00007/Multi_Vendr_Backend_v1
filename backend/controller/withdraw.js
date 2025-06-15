const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const Withdraw = require("../model/withdraw");
const sendEmail = require("../config/email.config");
const router = express.Router();

// create withdraw request --- only for seller
router.post(
  "/create-withdraw-request",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount, bankName, bankAccountNumber, bankIfscCode } = req.body;

      const data = {
        seller: req.seller._id,
        amount,
        bankName,
        bankAccountNumber,
        bankIfscCode,
      };

      try {
        await sendEmail({
          email: req.seller.email,
          subject: "Withdraw Request",
          message: `Hello ${req.seller.name}, Your withdraw request of ${amount}$ is processing. It will take 3days to 7days to processing! `,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }

      const withdraw = await Withdraw.create(data);

      const shop = await Shop.findById(req.seller._id);

      shop.availableBalance = shop.availableBalance - amount;

      await shop.save();

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all withdraws --- admnin

router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdraws = await Withdraw.find().sort({ createdAt: -1 }).populate("seller");

      res.status(201).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update withdraw request ---- admin
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sellerId } = req.body;

      if (!sellerId) {
        return next(new ErrorHandler("Seller ID is required", 400));
      }

      const withdraw = await Withdraw.findById(req.params.id);
      
      if (!withdraw) {
        return next(new ErrorHandler("Withdrawal request not found", 404));
      }

      if (withdraw.status === "succeed") {
        return next(new ErrorHandler("This withdrawal request has already been processed", 400));
      }

      withdraw.status = "Succeed";
      withdraw.updatedAt = Date.now();
      withdraw.transactionId = `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`;

      await withdraw.save();

      const shop = await Shop.findById(sellerId);
      
      if (!shop) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      const transection = {
        _id: withdraw._id,
        amount: withdraw.amount,
        updatedAt: withdraw.updatedAt,
        status: withdraw.status,
      };

      shop.transections = [...shop.transections, transection];
      await shop.save();

      try {
        await sendEmail({
          email: shop.email,
          subject: "Withdraw Request Approved",
          message: `Hello ${shop.name}, Your withdraw request of ${withdraw.amount}$ has been approved. Transaction ID: ${withdraw.transactionId}`,
        });
      } catch (error) {
        console.error("Error sending email:", error);
        // Don't return error here, continue with the response
      }

      res.status(200).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
