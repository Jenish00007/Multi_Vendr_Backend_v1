const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateUserId } = require("../utils/idGenerator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please enter your phone number!"],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  addresses: [
    {
      country: {
        type: String,
      },
      city: {
        type: String,
      },
      address1: {
        type: String,
      },
      address2: {
        type: String,
      },
      zipCode: {
        type: Number,
      },
      addressType: {
        type: String,
      },
    },
  ],
  role: {
    type: String,
    default: "user",
  },
  avatar: {
    type: String,
    required: true,
  },
  pushToken: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    index: true
  }
});

// Generate standardized User ID before saving
userSchema.pre("save", async function (next) {
  // Only generate userId if it doesn't exist
  if (!this.userId) {
    try {
      const User = this.constructor;
      let attempts = 0;
      const maxAttempts = 5;
      let generated = false;
      
      // Retry logic to handle potential race conditions
      while (!generated && attempts < maxAttempts) {
        try {
          // Generate new userId
          const newUserId = await generateUserId(User);
          
          // Check if this userId already exists (race condition check)
          const existingUser = await User.findOne({ userId: newUserId });
          if (!existingUser) {
            // ID is unique, assign it
            this.userId = newUserId;
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
        console.error("Failed to generate unique User ID after multiple attempts");
        // Continue without userId - it can be generated later
      }
    } catch (error) {
      console.error("Error generating User ID:", error);
      // Continue without userId if generation fails - it can be generated later
    }
  }
  next();
});

//  Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role,
      isPhoneVerified: this.isPhoneVerified
    }, 
    process.env.JWT_SECRET_KEY
  );
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiry (10 minutes)
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  };

  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }

  // Check if OTP is expired
  const now = new Date();
  if (now > this.otp.expiresAt) {
    // Clear expired OTP
    this.otp = undefined;
    return false;
  }

  // Check if OTP matches
  const isValid = this.otp.code === enteredOTP;
  
  if (isValid) {
    this.isPhoneVerified = true;
    this.otp = undefined; // Clear OTP after successful verification
  }

  return isValid;
};

module.exports = mongoose.model("User", userSchema);
