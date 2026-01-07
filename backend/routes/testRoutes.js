const express = require("express");
const router = express.Router();
const { sendPushNotification } = require("../firebase");

// Test endpoint to trigger socket + push notifications
router.post("/notify", async (req, res) => {
  try {
    const { userId, type, orderId, deliveryMan } = req.body;
    const io = req.app.get('io');

    if (!io) {
      return res.status(500).json({ error: "Socket.io not initialized" });
    }

    // Notification messages
    const messages = {
      orderConfirmed: {
        title: "Order Confirmed",
        body: `Your order #${orderId} has been confirmed by the vendor!`,
        data: { type: "orderConfirmed", orderId }
      },
      deliveryAssigned: {
        title: "Delivery Partner Assigned",
        body: `${deliveryMan?.name || 'Delivery partner'} is on the way to pick up your order!`,
        data: { type: "deliveryAssigned", orderId, deliveryMan }
      },
      deliveryNearby: {
        title: "Almost There!",
        body: `Your delivery partner will arrive in about 5 minutes!`,
        data: { type: "deliveryNearby", orderId }
      },
      deliveryArrived: {
        title: "Delivery Arrived",
        body: `Your order has been delivered! Enjoy your meal.`,
        data: { type: "deliveryArrived", orderId }
      }
    };

    const notification = messages[type];
    if (!notification) {
      return res.status(400).json({ 
        error: "Unknown notification type", 
        knownTypes: Object.keys(messages) 
      });
    }

    // Emit via Socket.io (for real-time web/app)
    const events = {
      orderConfirmed: () => io.to(userId).emit("orderConfirmed", { orderId }),
      deliveryAssigned: () => io.to(userId).emit("deliveryAssigned", { orderId, deliveryMan }),
      deliveryNearby: () => io.to(userId).emit("deliveryNearby", { orderId }),
      deliveryArrived: () => io.to(userId).emit("deliveryArrived", { orderId })
    };

    events[type]();
    console.log(`Socket emitted: ${type} to user ${userId}`);

    // Send FCM push notification (for mobile devices)
    const pushSent = await sendPushNotification(
      userId,
      notification.title,
      notification.body,
      notification.data
    );

    res.json({ 
      success: true, 
      emitted: type, 
      userId, 
      orderId,
      pushSent
    });
  } catch (error) {
    console.error("Test notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
