const { Expo } = require('expo-server-sdk');

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
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return {
        success: false,
        error: 'Invalid push token'
      };
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
    // Filter out invalid tokens
    const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));
    const invalidTokens = pushTokens.filter(token => !Expo.isExpoPushToken(token));

    if (invalidTokens.length > 0) {
      console.warn('Invalid push tokens found:', invalidTokens);
    }

    if (validTokens.length === 0) {
      return {
        success: false,
        error: 'No valid push tokens provided'
      };
    }

    // Create messages for all valid tokens
    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
      channelId: 'default'
    }));

    // Send the messages
    const chunks = expo.chunkPushNotifications(messages);
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
    const successCount = 0;
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

    console.log(`Bulk push notifications sent: ${successCount} successful, ${errors.length} failed`);
    return {
      success: true,
      totalSent: validTokens.length,
      successCount: successCount,
      errorCount: errors.length,
      errors: errors,
      invalidTokens: invalidTokens
    };

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

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
  sendOrderStatusNotification,
  sendPromotionalNotification,
  sendDeliveryNotification
}; 