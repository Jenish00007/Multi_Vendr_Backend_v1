const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require("../config/firebase-service-account.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send FCM notification to a single device
 * @param {string} fcmToken - The FCM token of the target device
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 * @returns {Promise<object>} - Result object with success status and details
 */
const sendFCMNotification = async (fcmToken, title, body, data = {}) => {
  try {
    if (!fcmToken || !title || !body) {
      return {
        success: false,
        error: "fcmToken, title, and body are required"
      };
    }

    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default"
        }
      },
      apns: {
        payload: {
          aps: { 
            sound: "default",
            badge: 1
          },
        },
      },
    };

    const response = await admin.messaging().send(message);

    return {
      success: true,
      messageId: response,
      fcmToken: fcmToken
    };
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    
    // Handle specific Firebase errors
    let errorMessage = error.message;
    if (error.code === 'app/invalid-credential') {
      errorMessage = "Firebase credentials are invalid. Please check your service account configuration.";
    } else if (error.code === 'messaging/invalid-registration-token') {
      errorMessage = "Invalid FCM token provided.";
    } else if (error.code === 'messaging/registration-token-not-registered') {
      errorMessage = "FCM token is not registered or has been unregistered.";
    }
    
    return {
      success: false,
      error: errorMessage,
      fcmToken: fcmToken
    };
  }
};

/**
 * Send FCM notifications to multiple devices
 * @param {Array} fcmTokens - Array of FCM tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 * @returns {Promise<object>} - Result object with success status and details
 */
const sendFCMNotificationToMultiple = async (fcmTokens, title, body, data = {}) => {
  try {
    if (!Array.isArray(fcmTokens) || fcmTokens.length === 0) {
      return {
        success: false,
        error: "fcmTokens array is required and must not be empty"
      };
    }

    if (!title || !body) {
      return {
        success: false,
        error: "title and body are required"
      };
    }

    const message = {
      tokens: fcmTokens,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default"
        }
      },
      apns: {
        payload: {
          aps: { 
            sound: "default",
            badge: 1
          },
        },
      },
    };

    // Use sendAll for older Firebase Admin SDK versions
    const response = await admin.messaging().sendAll(fcmTokens.map(token => ({
      ...message,
      token: token
    })));

    const successCount = response.responses.filter(r => r.success).length;
    const failureCount = response.responses.length - successCount;

    return {
      success: true,
      successCount: successCount,
      failureCount: failureCount,
      responses: response.responses,
      totalSent: fcmTokens.length
    };
  } catch (error) {
    console.error("Error sending FCM notifications to multiple devices:", error);
    
    // Handle specific Firebase errors
    let errorMessage = error.message;
    if (error.code === 'app/invalid-credential') {
      errorMessage = "Firebase credentials are invalid. Please check your service account configuration.";
    }
    
    return {
      success: false,
      error: errorMessage,
      totalSent: fcmTokens.length
    };
  }
};

/**
 * Send FCM notification to deliverymen for new orders
 * @param {Array} deliverymen - Array of deliveryman objects with expoPushToken
 * @param {object} order - Order object with details
 * @returns {Promise<object>} - Result object with success status and details
 */
const sendFCMNotificationToDeliverymen = async (deliverymen, order) => {
  try {
    if (!Array.isArray(deliverymen) || deliverymen.length === 0) {
      return {
        success: false,
        error: "No deliverymen provided"
      };
    }

    // Filter deliverymen with valid FCM tokens
    const validDeliverymen = deliverymen.filter(dm => 
      dm.expoPushToken && 
      dm.expoPushToken.trim() !== '' && 
      dm.expoPushToken !== null
    );

    if (validDeliverymen.length === 0) {
      return {
        success: false,
        error: "No deliverymen with valid FCM tokens found"
      };
    }

    // Create notification content
    const orderNumber = order._id.toString().slice(-6).toUpperCase();
    const shopName = order.cart && order.cart.length > 0 ? 
      order.cart[0].shopId?.name || 'Unknown Shop' : 'Unknown Shop';
    const totalItems = order.cart ? 
      order.cart.reduce((total, item) => total + item.quantity, 0) : 0;
    
    const title = `New Order Available - #${orderNumber}`;
    const body = `Order from ${shopName} - ${totalItems} items - ₹${order.totalPrice}`;

    // Prepare data payload
    const data = {
      orderId: order._id.toString(),
      orderNumber: orderNumber,
      shopName: shopName,
      totalItems: totalItems.toString(),
      totalPrice: order.totalPrice.toString(),
      type: "new_order"
    };

    console.log(`Sending FCM notifications to ${validDeliverymen.length} deliverymen for order: ${orderNumber}`);

    // Send notifications to each deliveryman individually for better error handling
    const results = [];
    for (const deliveryman of validDeliverymen) {
      console.log(`Processing FCM notification for deliveryman ID: ${deliveryman._id}, Name: ${deliveryman.name}`);
      try {
        const result = await sendFCMNotification(
          deliveryman.expoPushToken,
          title,
          body,
          data
        );

        results.push({
          deliverymanId: deliveryman._id,
          deliverymanName: deliveryman.name,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });

        if (result.success) {
          console.log(`FCM notification sent successfully to deliveryman ID: ${deliveryman._id}, Name: ${deliveryman.name}`);
        } else {
          console.error(`Failed to send FCM notification to deliveryman ID: ${deliveryman._id}, Name: ${deliveryman.name}`, result.error);
        }
      } catch (error) {
        console.error(`Error sending FCM notification to deliveryman ID: ${deliveryman._id}, Name: ${deliveryman.name}`, error.message);
        results.push({
          deliverymanId: deliveryman._id,
          deliverymanName: deliveryman.name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`FCM notification results: ${successCount}/${results.length} successful`);

    return {
      success: true,
      totalSent: validDeliverymen.length,
      successCount: successCount,
      failureCount: results.length - successCount,
      results: results
    };

  } catch (error) {
    console.error('Error sending FCM notifications to deliverymen:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendFCMNotification,
  sendFCMNotificationToMultiple,
  sendFCMNotificationToDeliverymen
};
