const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const razorpayConfig = require("../config/razorpay");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret,
});

// Helper function to check for repeating digits
const hasRepeatingDigits = (number) => {
  const digits = number.toString().split('');
  for (let i = 0; i < digits.length - 1; i++) {
    if (digits[i] === digits[i + 1]) {
      return true;
    }
  }
  return false;
};

// Create payment link
router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount, email, name, contact } = req.body;

      // Log the incoming request data
      console.log('Payment request data:', {
        amount,
        email,
        name,
        contact
      });

      // Input validation
      if (!amount || !email || !name || !contact) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: amount, email, name, and contact are required"
        });
      }

      // Validate amount is a positive number and within limits
      const amountInPaise = Math.round(amount * 100);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a positive number"
        });
      }

      if (amountInPaise < razorpayConfig.min_amount || amountInPaise > razorpayConfig.max_amount) {
        return res.status(400).json({
          success: false,
          message: `Amount must be between ₹${razorpayConfig.min_amount/100} and ₹${razorpayConfig.max_amount/100}`
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format"
        });
      }

      // Validate contact number (Indian phone numbers with additional checks)
      const contactRegex = /^[6-9]\d{9}$/;
      if (!contactRegex.test(contact)) {
        return res.status(400).json({
          success: false,
          message: "Invalid contact number format. Must be a 10-digit number starting with 6-9"
        });
      }

      // Check for repeating digits
      if (hasRepeatingDigits(contact)) {
        return res.status(400).json({
          success: false,
          message: "Contact number cannot contain repeating digits"
        });
      }

      const paymentData = {
        amount: amountInPaise,
        currency: razorpayConfig.currency,
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
        callback_url: razorpayConfig.callback_url,
        callback_method: razorpayConfig.callback_method,
        expire_by: Math.floor(Date.now() / 1000) + razorpayConfig.payment_link_expiry
      };

      console.log('Creating Razorpay payment link with data:', {
        ...paymentData,
        key_id: razorpayConfig.key_id
      });

      try {
        const paymentLink = await razorpay.paymentLink.create(paymentData);
        console.log('Razorpay payment link response:', paymentLink);

        if (!paymentLink || !paymentLink.short_url) {
          throw new Error("Failed to generate payment link");
        }

        res.status(200).json({
          success: true,
          paymentLink: paymentLink.short_url
        });
      } catch (razorpayError) {
        console.error("Razorpay API Error:", {
          error: razorpayError,
          errorMessage: razorpayError.message,
          errorResponse: razorpayError.response?.data,
          errorStatus: razorpayError.response?.status
        });

        // Handle specific Razorpay API errors
        if (razorpayError.response?.data) {
          const errorData = razorpayError.response.data;
          let errorMessage = 'Payment processing failed';

          if (errorData.error?.description) {
            errorMessage = errorData.error.description;
          } else if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }

          return res.status(500).json({
            success: false,
            message: `Razorpay API Error: ${errorMessage}`,
            error: process.env.NODE_ENV === 'development' ? errorData : undefined
          });
        }

        // Handle other Razorpay errors
        return res.status(500).json({
          success: false,
          message: `Payment processing failed: ${razorpayError.message || 'Unknown error'}`,
          error: process.env.NODE_ENV === 'development' ? razorpayError : undefined
        });
      }
    } catch (error) {
      console.error("General Error:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      });

      res.status(500).json({
        success: false,
        message: error.message || "Failed to process payment",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    res.status(200).json({ keyId: razorpayConfig.key_id });
  })
);

module.exports = router;
