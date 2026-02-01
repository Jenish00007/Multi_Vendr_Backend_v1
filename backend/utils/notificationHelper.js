const Notification = require("../model/notification");
const DeliveryMan = require("../model/deliveryman");
const User = require("../model/user");
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../config/firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
  }
}

// Helper function to create notifications
const createNotification = async (userId, title, description, type = "general", data = {}, orderId = null, shopId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      description,
      type,
      data,
      orderId,
      shopId,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Helper function to create order-related notifications AND send push notification
const createOrderNotification = async (userId, orderId, title, description, data = {}) => {
  try {
    // Create notification in database
    const notification = await createNotification(userId, title, description, "order", data, orderId);
    
    // Send push notification to user
    await sendPushNotificationToUser(userId, title, description, { ...data, orderId });
    
    return notification;
  } catch (error) {
    console.error("Error creating order notification:", error);
    throw error;
  }
};

// Helper function to send push notification to user
const sendPushNotificationToUser = async (userId, title, description, data = {}) => {
  try {
    // Find user with push token
    const user = await User.findById(userId);
    
    if (!user || !user.pushToken) {
      console.log(`User ${userId} not found or no push token available`);
      return { success: false, message: 'User not found or no push token' };
    }

    console.log(`Sending push notification to user: ${user.name || user.email}`);

    // Prepare FCM message for user
    const message = {
      token: user.pushToken,
      notification: {
        title: title,
        body: description
      },
      data: {
        type: data.type || 'order_update',
        orderId: data.orderId?.toString() || '',
        deliveryManName: data.deliveryManName || '',
        deliveryManPhone: data.deliveryManPhone || '',
        orderStatus: data.orderStatus || '',
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true
          }
        }
      }
    };

    // Send using Firebase Admin SDK
    const fcmResult = await admin.messaging().send(message);
    console.log(`✅ Push notification sent to user:`, fcmResult);
    
    return { 
      success: true, 
      message: 'Push notification sent to user',
      messageId: fcmResult
    };

  } catch (error) {
    console.error('Error sending push notification to user:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to send push notification to deliveryman
const sendPushNotificationToDeliveryMan = async (deliveryManId, title, description, data = {}) => {
  try {
    // Find deliveryman with expoPushToken
    const deliveryMan = await DeliveryMan.findById(deliveryManId);
    
    if (!deliveryMan || !deliveryMan.expoPushToken) {
      console.log(`DeliveryMan ${deliveryManId} not found or no expoPushToken available`);
      return { success: false, message: 'DeliveryMan not found or no expoPushToken' };
    }

    console.log(`Sending push notification to deliveryman: ${deliveryMan.name}`);

    // Prepare FCM message for deliveryman
    const message = {
      token: deliveryMan.expoPushToken,
      notification: {
        title: title,
        body: description
      },
      data: {
        type: data.type || 'order_update',
        orderId: data.orderId?.toString() || '',
        ...data
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true
          }
        }
      }
    };

    // Send using Firebase Admin SDK
    const fcmResult = await admin.messaging().send(message);
    console.log(`✅ Push notification sent to deliveryman:`, fcmResult);
    
    return { 
      success: true, 
      message: 'Push notification sent to deliveryman',
      messageId: fcmResult
    };

  } catch (error) {
    console.error('Error sending push notification to deliveryman:', error);
    return { success: false, error: error.message };
  }
};
const createOfferNotification = async (userId, title, description, data = {}, shopId = null) => {
  return await createNotification(userId, title, description, "offer", data, null, shopId);
};

// Helper function to create general notifications
const createGeneralNotification = async (userId, title, description, data = {}) => {
  return await createNotification(userId, title, description, "general", data);
};

// Helper function to create promotion notifications
const createPromotionNotification = async (userId, title, description, data = {}, shopId = null) => {
  return await createNotification(userId, title, description, "promotion", data, null, shopId);
};

// Helper function to send new order notifications to available deliverymen
const sendNewOrderNotificationToDeliverymen = async (order) => {
  try {
    // Find all available and approved deliverymen
    const deliverymen = await DeliveryMan.find({
      isAvailable: true,
      isApproved: true,
      expoPushToken: { $exists: true, $ne: null }
    });

    if (deliverymen.length === 0) {
      console.log('No available deliverymen found to notify');
      return { success: false, message: 'No available deliverymen found' };
    }

    console.log(`Found ${deliverymen.length} deliverymen to notify`);

    // Send notifications to each deliveryman individually using Firebase Admin SDK
    const results = [];
    
    for (const deliveryman of deliverymen) {
      try {
        const fcmToken = deliveryman.fcmToken || deliveryman.expoPushToken;
        
        if (!fcmToken) {
          console.log(`Skipping deliveryman ${deliveryman.name} - no FCM token`);
          continue;
        }

        console.log(`Sending FCM notification to ${deliveryman.name} with token: ${fcmToken.substring(0, 30)}...`);
        
        // Prepare FCM message
        const message = {
          token: fcmToken,
          notification: {
            title: 'New Order Available',
            body: `Order #${order.orderNumber || order._id.toString().slice(-6).toUpperCase()} is ready for pickup`
          },
          data: {
            type: 'new_order',
            orderId: order._id.toString(),
            orderNumber: order.orderNumber || order._id.toString().slice(-6).toUpperCase(),
            totalPrice: order.totalPrice.toString(),
            userAddress: order.shippingAddress?.address || 'Address not available'
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              priority: 'high'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                contentAvailable: true
              }
            }
          }
        };

        // Send using Firebase Admin SDK
        const fcmResult = await admin.messaging().send(message);
        console.log(`✅ FCM notification sent successfully to ${deliveryman.name}:`, fcmResult);
        
        results.push({
          deliveryman: deliveryman.name,
          status: 'success',
          message: 'Sent successfully',
          messageId: fcmResult
        });

      } catch (error) {
        console.error(`❌ Error sending FCM to ${deliveryman.name}:`, error);
        results.push({
          deliveryman: deliveryman.name,
          status: 'error',
          message: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    
    return { 
      success: successCount > 0, 
      message: `Notifications sent to ${successCount}/${deliverymen.length} deliverymen`,
      results
    };
  } catch (error) {
    console.error('Error sending notifications to deliverymen:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createNotification,
  createOrderNotification,
  sendPushNotificationToUser,
  sendPushNotificationToDeliveryMan,
  createOfferNotification,
  createGeneralNotification,
  createPromotionNotification,
  sendNewOrderNotificationToDeliverymen,
}; 