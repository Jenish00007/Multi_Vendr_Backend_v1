const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin, isDeliveryMan } = require("../middleware/auth");
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
        // Store product ID and shop ID for population
        const cartItem = {
          product: item._id, // Store product ID for population
          shopId: shopId, // Store shop ID for population
          quantity: item.qty || 1,
          price: item.price,
          name: item.name,
          images: item.images
        };
        shopItemsMap.get(shopId).push(cartItem);
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
          shop: shopId, // Add the shopId here
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
        .populate({
          path: 'cart.product',
          select: 'name images price discountPrice'
        })
        .populate({
          path: 'cart.shopId',
          select: 'name'
        });

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
          name: item.name || item.product?.name || "Product not found",
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || item.product?.images?.[0]?.url || "",
          shopName: item.shopId?.name || "Shop not found",
        })),
        shippingAddress: order.shippingAddress,
        paymentInfo: order.paymentInfo,
        deliveredAt: order.deliveredAt,
        paidAt: order.paidAt,
        otp: order.otp || null,
        delivery_instruction: order.delivery_instruction || '',
        delivery_man: order.delivery_man || null,
        store: order.store || null
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

// get order by id for deliveryman
router.get(
  "/deliveryman/get-order/:id",
  isDeliveryMan,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Deliveryman fetching order with ID:", req.params.id);
      console.log("Deliveryman ID:", req.deliveryMan._id);

      const order = await Order.findById(req.params.id)
        .populate({
          path: 'cart.product',
          select: 'name images price discountPrice'
        })
        .populate({
          path: 'cart.shopId',
          select: 'name address phone'
        })
        .populate('user', 'name phone');

      console.log("Found order:", order ? "Yes" : "No");

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      // Format the order data for deliveryman view
      const formattedOrder = {
        _id: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        itemsQty: order.cart.reduce((total, item) => total + item.quantity, 0),
        items: order.cart.map((item) => ({
          _id: item._id,
          name: item.name || item.product?.name || "Product not found",
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || item.product?.images?.[0]?.url || "",
          shopName: item.shopId?.name || "Shop not found",
        })),
        shippingAddress: order.shippingAddress,
        paymentInfo: order.paymentInfo,
        deliveredAt: order.deliveredAt,
        paidAt: order.paidAt,
        otp: order.otp || null,
        delivery_instruction: order.delivery_instruction || '',
        delivery_man: order.delivery_man || null,
        store: {
          name: order.cart[0]?.shopId?.name || "Store Name",
          address: order.cart[0]?.shopId?.address || "Store Address",
          phone: order.cart[0]?.shopId?.phone || "Store Phone"
        },
        user: {
          name: order.user?.name || "Customer Name",
          phone: order.user?.phone || "Customer Phone"
        }
      };

      console.log("Sending formatted order response to deliveryman");

      res.status(200).json({
        success: true,
        order: formattedOrder,
      });
    } catch (error) {
      console.error("Error in deliveryman get-order-by-id:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get deliveryman order history
router.get(
  "/deliveryman/order-history",
  isDeliveryMan,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Fetching order history for deliveryman:", req.deliveryMan._id);

      const orders = await Order.find({ delivery_man: req.deliveryMan._id })
        .sort({ createdAt: -1 })
        .populate({
          path: 'cart.product',
          select: 'name images price discountPrice'
        })
        .populate({
          path: 'cart.shopId',
          select: 'name address phone'
        })
        .populate('user', 'name phone');

      console.log("Found orders:", orders.length);

      const formattedOrders = orders.map(order => ({
        id: order._id,
        order_number: order._id.toString().slice(-6).toUpperCase(),
        order_items_count: order.cart.reduce((total, item) => total + item.quantity, 0),
        created_at: new Date(order.createdAt).toLocaleString(),
        status: order.status,
        total_price: order.totalPrice,
        store: {
          name: order.cart[0]?.shopId?.name || "Store Name",
          address: order.cart[0]?.shopId?.address || "Store Address"
        },
        customer: {
          name: order.user?.name || "Customer Name",
          address: order.shippingAddress?.address || "Customer Address"
        },
        payment_type: order.paymentInfo?.type || "COD",
        delivery_instruction: order.delivery_instruction || "",
        otp: order.otp || null
      }));

      res.status(200).json({
        success: true,
        orders: formattedOrders
      });
    } catch (error) {
      console.error("Error in deliveryman order history:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// accept order by deliveryman
router.put(
  "/deliveryman/accept-order/:id",
  isDeliveryMan,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Deliveryman accepting order:", req.params.id);
      console.log("Deliveryman ID:", req.deliveryMan._id);
      console.log("Request body:", req.body);

      // Validate order ID
      if (!req.params.id || req.params.id === 'undefined') {
        console.error("Invalid order ID provided");
        return next(new ErrorHandler("Invalid order ID", 400));
      }

      const order = await Order.findById(req.params.id)
        .populate({
          path: 'cart.product',
          select: 'name images price discountPrice'
        })
        .populate({
          path: 'cart.shopId',
          select: 'name address phone'
        })
        .populate('user', 'name phone');

      console.log("Found order:", order ? "Yes" : "No");

      if (!order) {
        console.error("Order not found with ID:", req.params.id);
        return next(new ErrorHandler("Order not found", 404));
      }

      console.log("Current order status:", order.status);
      console.log("Current delivery_man:", order.delivery_man);

      // Check if order is already assigned to another deliveryman
      if (order.delivery_man && order.delivery_man.toString() !== req.deliveryMan._id.toString()) {
        console.error("Order already assigned to another deliveryman");
        return next(new ErrorHandler("Order is already assigned to another deliveryman", 400));
      }

      // Check if order is in a valid state to be accepted
      if (order.status !== "Out for delivery" && order.status !== "Processing") {
        console.error("Invalid order status for acceptance:", order.status);
        return next(new ErrorHandler(`Order cannot be accepted in its current state: ${order.status}`, 400));
      }

      // Update order with deliveryman details
      order.delivery_man = req.deliveryMan._id;
      order.status = "Shipping";
      order.delivery_instruction = req.body.delivery_instruction || order.delivery_instruction;

      console.log("Saving order with updates:", {
        delivery_man: order.delivery_man,
        status: order.status,
        delivery_instruction: order.delivery_instruction
      });

      await order.save({ validateBeforeSave: false });

      console.log("Order saved after acceptance. Delivery Man ID:", order.delivery_man);

      // Format the response
      const formattedOrder = {
        _id: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        itemsQty: order.cart.reduce((total, item) => total + item.quantity, 0),
        items: order.cart.map((item) => ({
          _id: item._id,
          name: item.name || item.product?.name || "Product not found",
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || item.product?.images?.[0]?.url || "",
          shopName: item.shopId?.name || "Shop not found",
        })),
        shippingAddress: order.shippingAddress,
        paymentInfo: order.paymentInfo,
        deliveredAt: order.deliveredAt,
        paidAt: order.paidAt,
        otp: order.otp || null,
        delivery_instruction: order.delivery_instruction || '',
        delivery_man: order.delivery_man || null,
        store: {
          name: order.cart[0]?.shopId?.name || "Store Name",
          address: order.cart[0]?.shopId?.address || "Store Address",
          phone: order.cart[0]?.shopId?.phone || "Store Phone"
        },
        user: {
          name: order.user?.name || "Customer Name",
          phone: order.user?.phone || "Customer Phone"
        }
      };

      console.log("Sending successful response");
      res.status(200).json({
        success: true,
        message: "Order accepted successfully",
        order: formattedOrder
      });
    } catch (error) {
      console.error("Detailed error in accepting order:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ignore order by deliveryman
router.put(
  "/deliveryman/ignore-order/:id",
  isDeliveryMan,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Deliveryman ignoring order:", req.params.id);
      console.log("Deliveryman ID:", req.deliveryMan._id);

      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      // Check if order is already assigned
      if (order.delivery_man) {
        return next(new ErrorHandler("Order is already assigned to a deliveryman", 400));
      }

      // Check if order is in a valid state to be ignored
      if (order.status !== "Out for delivery" && order.status !== "Processing") {
        return next(new ErrorHandler(`Order cannot be ignored in its current state: ${order.status}`, 400));
      }

      // Add deliveryman to ignored_by array if it doesn't exist
      if (!order.ignored_by) {
        order.ignored_by = [];
      }

      // Check if deliveryman has already ignored this order
      if (order.ignored_by.includes(req.deliveryMan._id)) {
        return next(new ErrorHandler("You have already ignored this order", 400));
      }

      // Add deliveryman to ignored_by array
      order.ignored_by.push(req.deliveryMan._id);

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        message: "Order ignored successfully"
      });
    } catch (error) {
      console.error("Error in ignoring order:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// confirm order delivery by deliveryman with OTP
router.put(
  "/deliveryman/confirm-delivery/:id",
  isDeliveryMan,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { otp } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      if (order.status !== "Out for delivery") {
        return next(new ErrorHandler(`Order cannot be confirmed in its current state: ${order.status}`, 400));
      }

      // OTP verification
      if (!order.otp || order.otp !== otp) {
        return next(new ErrorHandler("Invalid OTP", 400));
      }

      order.status = "Delivered";
      order.deliveredAt = Date.now();

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        message: "Order delivered successfully",
        order,
      });
    } catch (error) {
      console.error("Error in confirm-delivery:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
