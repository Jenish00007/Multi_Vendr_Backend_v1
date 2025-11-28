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
    // QR Code payment fields
    qr_code_id: {
      type: String,
    },
    qr_expires_at: {
      type: Date,
    },
    qr_generated_at: {
      type: Date,
    },
    confirmed_by: {
      type: String, // Delivery man ID who confirmed payment
    },
    confirmed_at: {
      type: Date,
    },
    confirmation_notes: {
      type: String,
    },
    paid_at: {
      type: Date,
    }
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
    default: () => new Date(),
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  otp: {
    type: String,
    required: false,
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ignored_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryMan'
  }],
  delivery_instruction: {
    type: String,
    default: ''
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  orderId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    index: true
  }
});

// Generate standardized Order ID before saving
orderSchema.pre("save", async function (next) {
  // Only generate orderId if it doesn't exist
  if (!this.orderId) {
    try {
      const Order = this.constructor;
      let attempts = 0;
      const maxAttempts = 5;
      let generated = false;
      
      // Retry logic to handle potential race conditions
      while (!generated && attempts < maxAttempts) {
        try {
          // Generate new orderId
          const newOrderId = await generateOrderId(Order);
          
          // Check if this orderId already exists (race condition check)
          const existingOrder = await Order.findOne({ orderId: newOrderId });
          if (!existingOrder) {
            // ID is unique, assign it
            this.orderId = newOrderId;
            generated = true;
          } else {
            // ID already exists, try again
            attempts++;
            if (attempts < maxAttempts) {
              // Wait a tiny bit before retrying to avoid immediate collision
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          }
        } catch (genError) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw genError;
          }
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      if (!generated) {
        console.error("Failed to generate unique Order ID after multiple attempts");
        // Continue without orderId - it can be generated later
      }
    } catch (error) {
      console.error("Error generating Order ID:", error);
      // Continue without orderId if generation fails - it can be generated later
    }
  }
  next();
});

// Add indexes for better query performance
orderSchema.index({ "user._id": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ shop: 1 });
orderSchema.index({ deliveryMan: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
