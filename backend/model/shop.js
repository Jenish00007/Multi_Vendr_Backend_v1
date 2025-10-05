const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
        default: Date.now(),
      },
      updatedAt: {
        type: Date,
      },
    },
  ],
  // Delivery radius configuration
  deliveryRadius: {
    enabled: {
      type: Boolean,
      default: true
    },
    maxRadius: {
      type: Number,
      default: 10, // 10km default radius
      min: 1,
      max: 50
    },
    customRadius: {
      type: Number,
      default: null // If null, uses maxRadius
    }
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Create index for geospatial queries
shopSchema.index({ location: "2dsphere" });

// Hash password
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// comapre password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Shop", shopSchema);
