const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const { sendNewOrderNotificationToDeliverymen } = require("../utils/pushNotification");
const Order = require("../model/order");

// Initialize Firebase Admin once
if (!admin.apps.length) {
  const serviceAccount = require("../config/firebase-service-account.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ POST API to send notification
router.post("/send", async (req, res) => {
  try {
    const { fcmToken, title, body } = req.body;

    if (!fcmToken || !title || !body) {
      return res.status(400).json({
        success: false,
        error: "fcmToken, title, and body are required",
      });
    }

    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: { sound: "default" },
        },
      },
    };

    const response = await admin.messaging().send(message);

    return res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ✅ POST API to test new order notification to deliverymen
router.post("/test-new-order-notification", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "orderId is required",
      });
    }

    // Find the order
    const order = await Order.findById(orderId)
      .populate('cart.shopId', 'name')
      .populate('user', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    console.log(`Testing new order notification for order: ${orderId}`);
    const result = await sendNewOrderNotificationToDeliverymen(order);

    return res.status(200).json({
      success: true,
      message: "Notification test completed",
      result: result,
      orderDetails: {
        orderId: order._id,
        shopName: order.cart[0]?.shopId?.name || 'Unknown',
        totalPrice: order.totalPrice,
        totalItems: order.cart.reduce((total, item) => total + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error("❌ Error testing new order notification:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
