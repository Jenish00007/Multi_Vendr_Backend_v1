const { Expo } = require('expo-server-sdk');
const { sendPushNotificationToToken } = require('../firebase');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notification to a single user
 * @param {string} pushToken - The Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to send with notification
 * @returns {Promise<object>} - Result of the push notification
 */
const sendPushNotification = async (pushToken, title, body, data = {}) => {
  try {
    if (!pushToken) {
      return {
        success: false,
        error: 'Missing push token'
      };
    }

    if (!Expo.isExpoPushToken(pushToken)) {
      return await sendPushNotificationToToken(pushToken, title, body, data);
    }

    // Create the message
    const message = {
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
      channelId: 'default'
    };

    // Send the message
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    // Check for errors
    const errors = [];
    for (let ticket of tickets) {
      if (ticket.status === 'error') {
        errors.push({
          token: ticket.message?.to,
          error: ticket.details?.error
        });
      }
    }

    if (errors.length > 0) {
      console.error('Push notification errors:', errors);
      return {
        success: false,
        errors: errors
      };
    }

    console.log(`Push notification sent successfully to ${pushToken}`);
    return {
      success: true,
      tickets: tickets
    };

  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send push notification to multiple users
 * @param {Array<string>} pushTokens - Array of Expo push tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to send with notification
 * @returns {Promise<object>} - Result of the push notifications
 */
const sendBulkPushNotifications = async (pushTokens, title, body, data = {}) => {
  try {
    const tokens = Array.isArray(pushTokens) ? pushTokens : [];
    const expoTokens = tokens.filter(token => Expo.isExpoPushToken(token));
    const fcmTokens = tokens.filter(token => token && !Expo.isExpoPushToken(token));
    const invalidTokens = tokens.filter(token => !token);

    if (expoTokens.length === 0 && fcmTokens.length === 0) {
      return {
        success: false,
        error: 'No push tokens provided'
      };
    }

    const results = {
      success: true,
      expo: null,
      fcm: null,
      invalidTokens
    };

    if (expoTokens.length > 0) {
      const messages = expoTokens.map(token => ({
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'high',
        channelId: 'default'
      }));

      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];
      const errors = [];
      let successCount = 0;

      for (let chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending Expo push notification chunk:', error);
          errors.push({ error: error.message });
        }
      }

      for (let ticket of tickets) {
        if (ticket.status === 'error') {
          errors.push({
            token: ticket.message?.to,
            error: ticket.details?.error
          });
        } else {
          successCount++;
        }
      }

      results.expo = {
        totalSent: expoTokens.length,
        successCount,
        errorCount: errors.length,
        tickets,
        errors
      };

      if (errors.length > 0) {
        results.success = false;
      }
    }

    if (fcmTokens.length > 0) {
      const fcmResults = await Promise.all(
        fcmTokens.map(token => sendPushNotificationToToken(token, title, body, data))
      );
      const failures = fcmResults.filter(r => !r?.success);

      results.fcm = {
        totalSent: fcmTokens.length,
        successCount: fcmTokens.length - failures.length,
        errorCount: failures.length,
        results: fcmResults
      };

      if (failures.length > 0) {
        results.success = false;
      }
    }

    console.log(
      `Bulk push notifications sent (expo=${expoTokens.length}, fcm=${fcmTokens.length}). success=${results.success}`
    );
    return results;

  } catch (error) {
    console.error('Error sending bulk push notifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send order status notification to user
 * @param {string} pushToken - User's push token
 * @param {string} orderNumber - Order number
 * @param {string} status - Order status
 * @param {string} shopName - Shop name
 * @returns {Promise<object>} - Result of the push notification
 */
const sendOrderStatusNotification = async (pushToken, orderNumber, status, shopName) => {
  const title = `Order ${orderNumber} Update`;
  const body = `Your order from ${shopName} is now ${status}`;
  const data = {
    type: 'order_status',
    orderNumber: orderNumber,
    status: status,
    shopName: shopName
  };

  return await sendPushNotification(pushToken, title, body, data);
};

/**
 * Send promotional notification to user
 * @param {string} pushToken - User's push token
 * @param {string} title - Notification title
 * @param {string} message - Promotional message
 * @param {object} data - Additional data
 * @returns {Promise<object>} - Result of the push notification
 */
const sendPromotionalNotification = async (pushToken, title, message, data = {}) => {
  const notificationData = {
    type: 'promotional',
    ...data
  };

  return await sendPushNotification(pushToken, title, message, notificationData);
};

/**
 * Send delivery notification to user
 * @param {string} pushToken - User's push token
 * @param {string} orderNumber - Order number
 * @param {string} deliveryManName - Delivery person's name
 * @param {string} estimatedTime - Estimated delivery time
 * @returns {Promise<object>} - Result of the push notification
 */
const sendDeliveryNotification = async (pushToken, orderNumber, deliveryManName, estimatedTime) => {
  const title = `Delivery Update - Order ${orderNumber}`;
  const body = `${deliveryManName} is on the way! Estimated delivery: ${estimatedTime}`;
  const data = {
    type: 'delivery',
    orderNumber: orderNumber,
    deliveryManName: deliveryManName,
    estimatedTime: estimatedTime
  };

  return await sendPushNotification(pushToken, title, body, data);
};

/**
 * Send new order notification to available deliverymen
 * @param {object} order - Order object with details
 * @returns {Promise<object>} - Result of the push notifications
 */
const sendNewOrderNotificationToDeliverymen = async (order) => {
  try {
    const DeliveryMan = require('../model/deliveryman');
    
    // Get all available deliverymen with valid push tokens
    const availableDeliverymen = await DeliveryMan.find({
      isAvailable: true,
      isApproved: true,
      expoPushToken: { $exists: true, $ne: null, $ne: '' }
    }).select('expoPushToken name');

    if (availableDeliverymen.length === 0) {
      console.log('No available deliverymen with push tokens found');
      return {
        success: false,
        error: 'No available deliverymen with push tokens found'
      };
    }

    // Extract push tokens
    const pushTokens = availableDeliverymen
      .map(dm => dm.expoPushToken)
      .filter(token => token && token.trim() !== '');

    if (pushTokens.length === 0) {
      console.log('No valid push tokens found for deliverymen');
      return {
        success: false,
        error: 'No valid push tokens found for deliverymen'
      };
    }

    // Create notification content
    const orderNumber = order._id.toString().slice(-6).toUpperCase();
    
    // Try to get shop name from populated shop field first, then from cart items
    let shopName = 'Qauds';
    if (order.shop && order.shop.name) {
      shopName = order.shop.name;
    } else if (order.cart && order.cart.length > 0 && order.cart[0].shopId && order.cart[0].shopId.name) {
      shopName = order.cart[0].shopId.name;
    }
    
    const totalItems = order.cart ? order.cart.reduce((total, item) => total + item.quantity, 0) : 0;
    
    const title = `New Order Available - #${orderNumber}`;
    const body = `Order from ${shopName} - ${totalItems} items - ₹${order.totalPrice}`;
    
    const data = {
      type: 'new_order',
      orderId: order._id.toString(),
      orderNumber: orderNumber,
      shopName: shopName,
      totalPrice: order.totalPrice,
      totalItems: totalItems,
      userLocation: order.userLocation,
      shippingAddress: order.shippingAddress
    };

    console.log(`Sending new order notification to ${pushTokens.length} deliverymen`);
    console.log('Order details:', {
      orderId: order._id,
      orderNumber,
      shopName,
      totalPrice: order.totalPrice,
      totalItems
    });

    // Send bulk notifications
    const result = await sendBulkPushNotifications(pushTokens, title, body, data);
    
    console.log('Push notification result:', result);
    return result;

  } catch (error) {
    console.error('Error sending new order notification to deliverymen:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
  sendOrderStatusNotification,
  sendPromotionalNotification,
  sendDeliveryNotification,
  sendNewOrderNotificationToDeliverymen
}; 