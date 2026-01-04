# Push Notifications Setup Guide

This document explains how to set up and use push notifications in the Multi-vendor E-commerce backend.

## Overview

The backend now supports push notifications using Expo's push notification service. This allows the mobile apps to receive real-time notifications for various events like order updates, promotions, and delivery status changes.

## Features

- ✅ User push token management
- ✅ Order status notifications
- ✅ Promotional notifications
- ✅ Delivery notifications
- ✅ Bulk notifications
- ✅ Admin notification management
- ✅ Error handling and logging

## Setup

### 1. Dependencies

The following dependency has been added to `package.json`:
```json
{
  "expo-server-sdk": "^3.7.0"
}
```

### 2. Database Schema

The User model has been updated to include a `pushToken` field:
```javascript
pushToken: {
  type: String,
  default: null,
}
```

### 3. Environment Variables

No additional environment variables are required for basic functionality. The Expo push service works without authentication for development.

## API Endpoints

### User Management

#### Update Push Token
```
PUT /v2/user/expo-push-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

#### Login with Push Token
```
POST /v2/user/login-user
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### Notification Management

#### Get User Notifications
```
GET /v2/notification/notifications
Authorization: Bearer <token>
```

#### Mark Notification as Read
```
PUT /v2/notification/notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All Notifications as Read
```
PUT /v2/notification/notifications/read-all
Authorization: Bearer <token>
```

#### Get Unread Count
```
GET /v2/notification/notifications/unread-count
Authorization: Bearer <token>
```

### Push Notifications (Admin Only)

#### Send Single Push Notification
```
POST /v2/notification/send-push-notification
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user_id",
  "title": "Notification Title",
  "body": "Notification message",
  "data": {
    "customField": "value"
  }
}
```

#### Send Bulk Push Notifications
```
POST /v2/notification/send-bulk-push-notifications
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["user_id_1", "user_id_2"],
  "title": "Bulk Notification",
  "body": "Message for all users",
  "data": {
    "type": "promotional"
  }
}
```

#### Send Order Status Notification
```
POST /v2/notification/send-order-status-notification
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "orderNumber": "ORD-12345",
  "status": "Processing",
  "shopName": "Shop Name"
}
```

#### Send Promotional Notification
```
POST /v2/notification/send-promotional-notification
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user_id",
  "title": "Special Offer!",
  "message": "Get 20% off on all items",
  "data": {
    "offerId": "offer_123",
    "discount": "20%"
  }
}
```

#### Send Delivery Notification
```
POST /v2/notification/send-delivery-notification
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "orderNumber": "ORD-12345",
  "deliveryManName": "John Doe",
  "estimatedTime": "30 minutes"
}
```

## Mobile App Integration

### 1. Get Push Token

In your React Native app, use Expo's notification service:

```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const getExpoPushToken = async () => {
  let token = null;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  }
  return token;
};
```

### 2. Send Token to Backend

After login, send the push token to the backend:

```javascript
const sendPushTokenToBackend = async (expoPushToken, accessToken) => {
  try {
    const response = await fetch(`${API_URL}/user/expo-push-token`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token: expoPushToken }),
    });
    
    if (response.ok) {
      console.log('Push token updated successfully');
    }
  } catch (error) {
    console.error('Failed to send push token:', error);
  }
};
```

### 3. Handle Incoming Notifications

Set up notification handlers in your app:

```javascript
import * as Notifications from 'expo-notifications';

// Handle notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Handle notification received
Notifications.addNotificationReceivedListener(notification => {
  console.log('Notification received:', notification);
});

// Handle notification response (when user taps notification)
Notifications.addNotificationResponseReceivedListener(response => {
  console.log('Notification response:', response);
  // Navigate to appropriate screen based on notification data
});
```

## Usage Examples

### 1. Order Status Updates

When an order status changes, send a notification:

```javascript
// In your order controller
const sendOrderUpdateNotification = async (userId, orderNumber, status, shopName) => {
  try {
    await fetch(`${API_URL}/notification/send-order-status-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId,
        orderNumber,
        status,
        shopName
      })
    });
  } catch (error) {
    console.error('Failed to send order notification:', error);
  }
};
```

### 2. Promotional Campaigns

Send promotional notifications to users:

```javascript
// Send to specific users
const sendPromotionalNotification = async (userIds, title, message) => {
  try {
    await fetch(`${API_URL}/notification/send-bulk-push-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userIds,
        title,
        body: message,
        data: { type: 'promotional' }
      })
    });
  } catch (error) {
    console.error('Failed to send promotional notification:', error);
  }
};
```

### 3. Delivery Updates

Notify users about delivery status:

```javascript
const sendDeliveryNotification = async (userId, orderNumber, deliveryManName, estimatedTime) => {
  try {
    await fetch(`${API_URL}/notification/send-delivery-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        orderNumber,
        deliveryManName,
        estimatedTime
      })
    });
  } catch (error) {
    console.error('Failed to send delivery notification:', error);
  }
};
```

## Error Handling

The push notification system includes comprehensive error handling:

1. **Invalid Tokens**: Automatically filters out invalid Expo push tokens
2. **Network Errors**: Gracefully handles network failures
3. **Rate Limiting**: Respects Expo's rate limits
4. **Logging**: Detailed logging for debugging

## Testing

### 1. Test Push Token

You can test push notifications using Expo's push notification tool:
https://expo.dev/notifications

### 2. Test Endpoints

Use Postman or similar tools to test the API endpoints:

1. Login with a push token
2. Send a test notification
3. Verify the notification appears on the device

## Security Considerations

1. **Token Validation**: All push tokens are validated before sending
2. **Admin Access**: Sensitive operations require admin privileges
3. **Rate Limiting**: Implement rate limiting for notification endpoints
4. **Data Privacy**: Only send necessary data in notifications

## Troubleshooting

### Common Issues

1. **Notifications not received**
   - Check if push token is valid
   - Verify device permissions
   - Check network connectivity

2. **Invalid token errors**
   - Ensure token format is correct
   - Check if token is from a physical device

3. **Permission denied**
   - Verify admin privileges for protected endpoints
   - Check authentication token

### Debug Logs

Enable debug logging by checking console output for:
- Push token updates
- Notification sending attempts
- Error messages

## Future Enhancements

1. **Scheduled Notifications**: Send notifications at specific times
2. **Notification Templates**: Predefined notification templates
3. **Analytics**: Track notification delivery and engagement
4. **A/B Testing**: Test different notification content
5. **Segmentation**: Send notifications to user segments

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify API endpoint responses
3. Test with Expo's notification tool
4. Review this documentation

---

**Note**: This implementation uses Expo's free push notification service. For production apps with high volume, consider upgrading to Expo's paid plans or implementing your own push notification service. 