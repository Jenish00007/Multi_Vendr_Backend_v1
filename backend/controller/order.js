const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin, isDeliveryMan } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");
const { createOrderNotification } = require("../utils/notificationHelper");

// create new order
router.post(
  "/create-order",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, totalPrice, paymentInfo, userLocation } = req.body;

      // Get user details from the authenticated token
      const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber
      };

      // Validate userLocation if provided
      if (userLocation) {
        if (typeof userLocation.latitude !== 'number' || typeof userLocation.longitude !== 'number') {
          return next(new ErrorHandler("Invalid location coordinates provided", 400));
        }
        
        // Validate latitude range (-90 to 90)
        if (userLocation.latitude < -90 || userLocation.latitude > 90) {
          return next(new ErrorHandler("Invalid latitude value", 400));
        }
        
        // Validate longitude range (-180 to 180)
        if (userLocation.longitude < -180 || userLocation.longitude > 180) {
          return next(new ErrorHandler("Invalid longitude value", 400));
        }
      }

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
        
        console.log('Creating order with userLocation:', userLocation);
        
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
          userLocation, // Save user location in the order
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
        userLocation: order.userLocation || null,
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

      const previousStatus = order.status;
      order.status = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharge = order.totalPrice * 0.1;
        await updateSellerInfo(order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      // Create notification for order status change
      try {
        let notificationTitle = "";
        let notificationDescription = "";

        switch (req.body.status) {
          case "Processing":
            notificationTitle = "Order Processing";
            notificationDescription = `Your order #${order.orderNumber} is now being processed.`;
            break;
          case "Transferred to delivery partner":
            notificationTitle = "Order Out for Delivery";
            notificationDescription = `Your order #${order.orderNumber} has been transferred to our delivery partner.`;
            break;
          case "Delivered":
            notificationTitle = "Order Delivered";
            notificationDescription = `Your order #${order.orderNumber} has been successfully delivered!`;
            break;
          case "Cancelled":
            notificationTitle = "Order Cancelled";
            notificationDescription = `Your order #${order.orderNumber} has been cancelled.`;
            break;
          default:
            notificationTitle = "Order Status Updated";
            notificationDescription = `Your order #${order.orderNumber} status has been updated to ${req.body.status}.`;
        }

        await createOrderNotification(
          order.user,
          order._id,
          notificationTitle,
          notificationDescription,
          { previousStatus, newStatus: req.body.status }
        );
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't fail the order update if notification fails
      }

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
        .populate('deliveryMan')
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
      console.log("Order deliveryMan (in get-order):", order?.deliveryMan);
      console.log("Deliveryman ID from request (in get-order):", req.deliveryMan._id);

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
        userLocation: order.userLocation || null,
        deliveredAt: order.deliveredAt,
        paidAt: order.paidAt,
        otp: order.otp || null,
        delivery_instruction: order.delivery_instruction || '',
        deliveryMan: order.deliveryMan || null,
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
        .populate('deliveryMan')
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
        itemsQty: (order.cart || []).reduce((total, item) => total + item.quantity, 0),
        items: (order.cart || []).map((item) => ({
          _id: item._id,
          name: item.name || item.product?.name || "Product not found",
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || item.product?.images?.[0]?.url || "",
          shopName: item.shopId?.name || "Shop not found",
        })),
        shippingAddress: order.shippingAddress,
        paymentInfo: order.paymentInfo,
        userLocation: order.userLocation || null,
        deliveredAt: order.deliveredAt,
        paidAt: order.paidAt,
        otp: order.otp || null,
        delivery_instruction: order.delivery_instruction || '',
        deliveryMan: order.deliveryMan || null,
        store: {
          name: order.cart[0]?.shopId?.name || "Store Name",
          address: order.cart[0]?.shopId?.address || "Store Address",
          phone: order.cart[0]?.shopId?.phone || "Store Phone",
        },
        user: {
          name: order.user?.name || "Customer Name",
          phone: order.user?.phone || "Customer Phone",
        },
      };

      console.log("Sending formatted order response to deliveryman");
      console.log("Formatted order deliveryMan:", formattedOrder.deliveryMan);
      console.log("Formatted order items:", formattedOrder.items);
      console.log("Formatted order itemsQty:", formattedOrder.itemsQty);

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
      const deliveryManId = req.deliveryMan._id;
      console.log("Fetching order history for deliveryman:", deliveryManId);

      const orders = await Order.find({ 
        deliveryMan: deliveryManId,
        status: { $in: ["Delivered", "Shipping"] }
      })
        .sort({ createdAt: -1 })
        .populate('deliveryMan')
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
      console.log("Order statuses:", orders.map(o => o.status));
      console.log("Delivery man IDs:", orders.map(o => o.deliveryMan?._id));

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
        otp: order.otp || null,
        userLocation: order.userLocation || null
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
        .populate('deliveryMan')
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
      console.log("Current deliveryMan:", order.deliveryMan);

      // Check if order is already assigned to another deliveryman
      if (order.deliveryMan && order.deliveryMan.toString() !== req.deliveryMan._id.toString()) {
        console.error("Order already assigned to another deliveryman");
        return next(new ErrorHandler("Order is already assigned to another deliveryman", 400));
      }

      // Check if order is in a valid state to be accepted
      if (order.status !== "Processing" && order.status !== "Transferred to delivery partner") {
        console.error("Invalid order status for acceptance:", order.status);
        return next(new ErrorHandler(`Order cannot be accepted in its current state: ${order.status}`, 400));
      }

      // Update order with deliveryman details
      console.log("Before update - Order deliveryMan:", order.deliveryMan);
      console.log("Setting deliveryMan to:", req.deliveryMan._id);
      
      // Use findByIdAndUpdate to ensure atomic update
      const updatedOrder = await Order.findByIdAndUpdate(
        order._id,
        {
          $set: {
            deliveryMan: req.deliveryMan._id,
            status: "Out for delivery",
            delivery_instruction: req.body.delivery_instruction || order.delivery_instruction
          }
        },
        { 
          new: true,
          runValidators: false
        }
      ).populate('deliveryMan')
       .populate({
         path: 'cart.product',
         select: 'name images price discountPrice'
       })
       .populate({
         path: 'cart.shopId',
         select: 'name address phone'
       })
       .populate('user', 'name phone');

      console.log("After update - Order deliveryMan:", updatedOrder.deliveryMan);

      // Format the response
      const formattedOrder = {
        _id: updatedOrder._id,
        status: updatedOrder.status,
        totalPrice: updatedOrder.totalPrice,
        createdAt: updatedOrder.createdAt,
        itemsQty: updatedOrder.cart.reduce((total, item) => total + item.quantity, 0),
        items: updatedOrder.cart.map((item) => ({
          _id: item._id,
          name: item.name || item.product?.name || "Product not found",
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || item.product?.images?.[0]?.url || "",
          shopName: item.shopId?.name || "Shop not found",
        })),
        shippingAddress: updatedOrder.shippingAddress,
        paymentInfo: updatedOrder.paymentInfo,
        userLocation: updatedOrder.userLocation || null,
        deliveredAt: updatedOrder.deliveredAt,
        paidAt: updatedOrder.paidAt,
        otp: updatedOrder.otp || null,
        delivery_instruction: updatedOrder.delivery_instruction || '',
        deliveryMan: updatedOrder.deliveryMan || null,
        store: {
          name: updatedOrder.cart[0]?.shopId?.name || "Store Name",
          address: updatedOrder.cart[0]?.shopId?.address || "Store Address",
          phone: updatedOrder.cart[0]?.shopId?.phone || "Store Phone"
        },
        user: {
          name: updatedOrder.user?.name || "Customer Name",
          phone: updatedOrder.user?.phone || "Customer Phone"
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
      if (order.deliveryMan) {
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
      console.log("Confirming delivery for order:", req.params.id);
      console.log("DeliveryMan ID:", req.deliveryMan._id);
      console.log("OTP provided:", otp);

      const order = await Order.findById(req.params.id)
        .populate('deliveryMan')
        .populate({
          path: 'cart.product',
          select: 'name images price discountPrice'
        })
        .populate({
          path: 'cart.shopId',
          select: 'name address phone'
        })
        .populate('user', 'name phone');

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      console.log("Found order:", order ? "Yes" : "No");
      console.log("Order deliveryMan (after populate):", order.deliveryMan);
      console.log("Order status:", order.status);
      console.log("Order OTP:", order.otp);

      // Verify this delivery man is assigned to the order
      if (!order.deliveryMan || order.deliveryMan._id.toString() !== req.deliveryMan._id.toString()) {
        console.error("Delivery man mismatch (during check):");
        console.error("  orderDeliveryMan._id:", order.deliveryMan?._id);
        console.error("  requestDeliveryMan._id:", req.deliveryMan._id);
        return next(new ErrorHandler("You are not authorized to deliver this order", 403));
      }

      if (order.status !== "Out for delivery") {
        console.error("Invalid order status:", order.status);
        return next(new ErrorHandler(`Order cannot be confirmed in its current state: ${order.status}`, 400));
      }

      // OTP verification
      if (!order.otp || order.otp !== otp) {
        console.error("OTP mismatch:", {
          providedOTP: otp,
          storedOTP: order.otp
        });
        return next(new ErrorHandler("Invalid OTP", 400));
      }

      // Ensure deliveryMan field is preserved
      order.status = "Delivered";
      order.deliveredAt = Date.now();
      order.deliveryMan = req.deliveryMan._id; // Explicitly set deliveryMan again

      console.log("Saving order with updates:", {
        status: order.status,
        deliveredAt: order.deliveredAt,
        deliveryMan: order.deliveryMan
      });

      await order.save({ validateBeforeSave: false });

      // Verify the save
      const savedOrder = await Order.findById(order._id);
      console.log("After save - Order status:", savedOrder.status);
      console.log("After save - Order deliveryMan:", savedOrder.deliveryMan);

      res.status(200).json({
        success: true,
        message: "Order delivered successfully",
        order: savedOrder,
      });
    } catch (error) {
      console.error("Error in confirm-delivery:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
