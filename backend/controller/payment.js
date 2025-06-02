const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment link
router.post(
  "/create-payment-link",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount, email, name, contact } = req.body;

      const paymentLink = await razorpay.paymentLink.create({
        amount: amount * 100, 
        currency: "INR",
        accept_partial: false,
        reference_id: "order_" + Date.now(),
        description: "Payment for your order",
        customer: {
          name: name,
          email: email,
          contact: contact
        },
        notify: {
          sms: true,
          email: true
        },
        reminder_enable: true,
        notes: {
          order_id: "order_" + Date.now()
        },
        callback_url: `${process.env.FRONTEND_URL}/payment-success`,
        callback_method: "get"
      });

      res.status(200).json({
        success: true,
        paymentLink: paymentLink.short_url
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

// Verify payment
router.post(
  "/verify",
  catchAsyncErrors(async (req, res, next) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  })
);

// Get Razorpay key
router.get(
  "/razorpayapikey",
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ keyId: process.env.RAZORPAY_KEY_ID });
  })
);

module.exports = router;
