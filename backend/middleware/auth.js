const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");
const DeliveryMan = require("../model/deliveryman");

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Check if the token is for an admin user
    if (decoded.role === "Admin") {
      return next(new ErrorHandler("Admin users cannot access this resource", 403));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Double check the user's role
    if (user.role === "Admin") {
      return next(new ErrorHandler("Admin users cannot access this resource", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token", 401));
  }
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const seller = await Shop.findById(decoded.id);
  
  if (!seller) {
    return next(new ErrorHandler("Seller not found", 404));
  }

  req.seller = seller;
  next();
});

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} can not access this resources!`)
      );
    }
    next();
  };
};

exports.isDeliveryMan = catchAsyncErrors(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const deliveryMan = await DeliveryMan.findById(decoded.id);
    
    if (!deliveryMan) {
      return next(new ErrorHandler("Delivery man not found", 404));
    }

    if (!deliveryMan.isApproved) {
      return next(new ErrorHandler("Your account is pending approval", 403));
    }

    req.deliveryMan = deliveryMan;
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token", 401));
  }
});

// Why this auth?
// This auth is for the user to login and get the token
// This token will be used to access the protected routes like create, update, delete, etc. (autharization)
