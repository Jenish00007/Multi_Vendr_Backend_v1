const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateShopId } = require("../utils/idGenerator");

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your shop name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your shop email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    default: "Seller",
  },
  avatar: {
    type: String,
    required: true,
  },
  zipCode: {
    type: Number,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false
  },
  businessHours: {
    monday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: "09:00" },
      closeTime: { type: String, default: "18:00" }
    },
    tuesday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: "09:00" },
      closeTime: { type: String, default: "18:00" }
    },
    wednesday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: "09:00" },
      closeTime: { type: String, default: "18:00" }
    },
    thursday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: "09:00" },
      closeTime: { type: String, default: "18:00" }
    },
    friday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: "09:00" },
      closeTime: { type: String, default: "18:00" }
    },
    saturday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: "09:00" },
      closeTime: { type: String, default: "18:00" }
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: "09:00" },
      closeTime: { type: String, default: "18:00" }
    }
  },
  withdrawMethod: {
    type: Object,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  expoPushToken: {
    type: String,
    default: null,
  },
  transections: [
    {
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        default: "Out for delivery",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  shopId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    index: true
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Create index for geospatial queries
shopSchema.index({ location: "2dsphere" });

// Generate standardized Shop ID before saving
shopSchema.pre("save", async function (next) {
  // Only generate shopId if it doesn't exist
  if (!this.shopId) {
    try {
      const Shop = this.constructor;
      let attempts = 0;
      const maxAttempts = 5;
      let generated = false;
      
      // Retry logic to handle potential race conditions
      while (!generated && attempts < maxAttempts) {
        try {
          // Generate new shopId
          const newShopId = await generateShopId(Shop);
          
          // Check if this shopId already exists (race condition check)
          const existingShop = await Shop.findOne({ shopId: newShopId });
          if (!existingShop) {
            // ID is unique, assign it
            this.shopId = newShopId;
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
        console.error("Failed to generate unique Shop ID after multiple attempts");
        // Continue without shopId - it can be generated later
      }
    } catch (error) {
      console.error("Error generating Shop ID:", error);
      // Continue without shopId if generation fails - it can be generated later
    }
  }
  next();
});

// Hash password
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY);
};

// comapre password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Shop", shopSchema);
