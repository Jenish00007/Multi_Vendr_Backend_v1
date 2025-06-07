const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");

// create new order
router.post(
  "/create-order",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, totalPrice, paymentInfo } = req.body;

      // Get user details from the authenticated token
      const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber
      };

      //   group cart items by shopId
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // create an order for each shop
      const orders = [];

      for (const [shopId, items] of shopItemsMap) {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
          otp, // Save OTP in the order
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
        otps: orders.map(order => order.otp), // Return OTPs for now
      });
    } catch (error) {
      console.error("Error creating order:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of user
router.get(
  "/get-all-orders",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Fetching orders for user:", req.user._id);
      
      const orders = await Order.find({ "user._id": req.user._id })
        .sort({
          createdAt: -1,
        })
        .populate("cart.product", "name images price discountPrice")
        .populate("cart.shopId", "name");

      console.log("Found orders:", orders.length);
      if (orders.length > 0) {
        console.log("Sample order:", JSON.stringify(orders[0], null, 2));
      }

      const formattedOrders = orders.map((order) => ({
        _id: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        itemsQty: order.cart.reduce((total, item) => total + item.quantity, 0),
        items: order.cart.map((item) => ({
          _id: item._id,
          name: item.product?.name || "Product not found",
          quantity: item.quantity,
          price: item.price,
          image: item.product?.images[0]?.url || "",
          shopName: item.shopId?.name || "Shop not found",
        })),
        shippingAddress: order.shippingAddress,
        paymentInfo: order.paymentInfo,
      }));

      res.status(200).json({
        success: true,
        orders: formattedOrders,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update order status for seller    ---------------(product)
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      if (req.body.status === "Transferred to delivery partner") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      order.status = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharge = order.totalPrice * 0.1;
        await updateSellerInfo(order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock -= qty;
        product.sold_out += qty;

        await product.save({ validateBeforeSave: false });
      }

      async function updateSellerInfo(amount) {
        const seller = await Shop.findById(req.seller.id);

        seller.availableBalance = amount;

        await seller.save();
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order Refund successfull!",
      });

      if (req.body.status === "Refund Success") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock += qty;
        product.sold_out -= qty;

        await product.save({ validateBeforeSave: false });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get order by id
router.get(
  "/get-order/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Fetching order with ID:", req.params.id);
      console.log("Authenticated user ID:", req.user._id);

      const order = await Order.findById(req.params.id)
        .populate("cart.product", "name images price discountPrice")
        .populate("cart.shopId", "name");

      console.log("Found order:", order ? "Yes" : "No");

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      // Check if the order belongs to the authenticated user
      console.log("Order user ID:", order.user._id);
      console.log("Request user ID:", req.user._id);

      if (order.user._id.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to view this order", 403));
      }

      const formattedOrder = {
        _id: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        itemsQty: order.cart.reduce((total, item) => total + item.quantity, 0),
        items: order.cart.map((item) => ({
          _id: item._id,
          name: item.product?.name || "Product not found",
          quantity: item.quantity,
          price: item.price,
          image: item.product?.images[0]?.url || "",
          shopName: item.shopId?.name || "Shop not found",
        })),
        shippingAddress: order.shippingAddress,
        paymentInfo: order.paymentInfo,
        deliveredAt: order.deliveredAt,
        paidAt: order.paidAt
      };

      console.log("Sending formatted order response");

      res.status(200).json({
        success: true,
        order: formattedOrder,
      });
    } catch (error) {
      console.error("Error in get-order-by-id:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
