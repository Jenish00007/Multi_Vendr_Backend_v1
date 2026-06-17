const admin = require('firebase-admin');

// Initialize Firebase Admin with your service account key
// You'll need to download the service account JSON file from Firebase Console
const serviceAccount = require('./config/firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function sendPushNotificationToToken(token, title, body, data = {}) {
  try {
    if (!token) {
      return {
        success: false,
        error: 'Missing FCM token'
      };
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    return {
      success: true,
      response
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Send push notification via FCM
async function sendPushNotification(userId, title, body, data = {}) {
  try {
    // Get user's FCM token from database (you'll need to implement this)
    const user = await getUserFromDB(userId);
    if (!user || !user.pushToken) {
      console.log('No FCM token found for user:', userId);
      return false;
    }

    const message = {
      token: user.pushToken,
      notification: {
        title,
        body,
      },
      data: Object.fromEntries(
        Object.entries({ type: data.type || 'orderUpdate', orderId: data.orderId || '', ...data })
          .map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])
      ),
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

// Helper: Get user from database (replace with your actual DB query)
async function getUserFromDB(userId) {
  // Example with Mongoose (adjust to your setup)
  try {
    const User = require('./model/user');
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

module.exports = { sendPushNotification, sendPushNotificationToToken };
