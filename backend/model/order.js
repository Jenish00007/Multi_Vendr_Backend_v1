const mongoose = require("mongoose");
const { generateOrderId } = require("../utils/idGenerator");

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
    phoneNumber: String,
    userId: String
  },
  orderId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  orderNumber: {
    type: String,
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
  userLocation: {
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    deliveryAddress: {
      type: String,
      required: false,
    }
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
  deliveryNearbyNotified: {
    type: Boolean,
    default: false,
  },
  deliveryArrivedNotified: {
    type: Boolean,
    default: false,
  },
});

// Generate standardized Order ID before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    try {
      const Order = this.constructor;
      let attempts = 0;
      const maxAttempts = 5;
      let generated = false;
      
      while (!generated && attempts < maxAttempts) {
        try {
          const newOrderId = await generateOrderId(Order);
          const existingOrder = await Order.findOne({ orderId: newOrderId });
          if (!existingOrder) {
            this.orderId = newOrderId;
            generated = true;
          } else {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } catch (genError) {
          attempts++;
          if (attempts >= maxAttempts) throw genError;
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    } catch (error) {
      console.error("Error generating Order ID:", error);
    }
  }
  next();
});

// Add indexes for better query performance
orderSchema.index({ "user._id": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ shop: 1 });
orderSchema.index({ deliveryMan: 1 });

module.exports = mongoose.model("Order", orderSchema);
