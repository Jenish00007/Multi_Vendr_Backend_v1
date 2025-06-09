const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  cart: {
    type: Array,
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  user: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: String,
    email: String,
    phoneNumber: String
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  deliveryMan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryMan'
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  paidAt: {
    type: Date,
    default: Date.now(),
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  otp: {
    type: String,
    required: false,
  },
});

// Add indexes for better query performance
orderSchema.index({ "user._id": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ shop: 1 });
orderSchema.index({ deliveryMan: 1 });

module.exports = mongoose.model("Order", orderSchema);
