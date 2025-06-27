# Notification System Documentation

## Overview
This document describes the notification system implemented for the multi-vendor e-commerce application. The system allows users to receive notifications about orders, offers, promotions, and general updates.

## Backend Implementation

### Models

#### Notification Model (`backend/model/notification.js`)
- **user**: Reference to the user who will receive the notification
- **title**: Notification title
- **description**: Notification description/message
- **type**: Type of notification (order, offer, general, promotion)
- **isRead**: Boolean flag to mark if notification has been read
- **data**: Additional data in JSON format
- **orderId**: Reference to order (for order-related notifications)
- **shopId**: Reference to shop (for shop-related notifications)
- **timestamps**: Created and updated timestamps

### Controllers

#### Notification Controller (`backend/controller/notification.js`)
Provides the following endpoints:

- `GET /v2/notification/notifications` - Get all notifications for a user (with pagination)
- `PUT /v2/notification/notifications/:id/read` - Mark a notification as read
- `PUT /v2/notification/notifications/read-all` - Mark all notifications as read
- `DELETE /v2/notification/notifications/:id` - Delete a specific notification
- `DELETE /v2/notification/notifications` - Delete all notifications for a user
- `GET /v2/notification/notifications/unread-count` - Get unread notification count
- `POST /v2/notification/create-notification` - Create a new notification (internal use)

### Utility Functions

#### Notification Helper (`backend/utils/notificationHelper.js`)
Provides helper functions for creating notifications:

- `createNotification()` - Create a general notification
- `createOrderNotification()` - Create order-related notifications
- `createOfferNotification()` - Create offer/promotion notifications
- `createGeneralNotification()` - Create general notifications
- `createPromotionNotification()` - Create promotion notifications

### Integration Points

#### Order Status Updates
The order controller automatically creates notifications when order status changes:
- Order Processing
- Order Out for Delivery
- Order Delivered
- Order Cancelled

## Frontend Implementation

### Notification Screen (`Quixo_New/src/screens/Notification/Notification.js`)
- Fetches notifications from local backend API
- Supports pagination and pull-to-refresh
- Shows unread/read status with visual indicators
- Allows marking notifications as read by tapping
- Navigates to relevant screens based on notification type

### Header Badge
- Shows unread notification count in the header
- Updates automatically when navigating between screens
- Displays "99+" for counts over 99

## API Endpoints

### Authentication Required
All notification endpoints require authentication via Bearer token.

### Response Format
```json
{
  "success": true,
  "notifications": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalNotifications": 100,
    "unreadCount": 15
  }
}
```

## Setup Instructions

### 1. Database Setup
The notification model will be automatically created when the server starts.

### 2. Add Sample Data
Run the sample data script to add test notifications:
```bash
cd backend
node scripts/addSampleNotifications.js
```

### 3. Test the System
1. Start the backend server
2. Start the frontend app
3. Login with a user account
4. Navigate to the notification screen
5. Check for notification badge in header

## Usage Examples

### Creating Notifications from Other Controllers
```javascript
const { createOrderNotification } = require('../utils/notificationHelper');

// In order controller
await createOrderNotification(
  order.user,
  order._id,
  "Order Delivered",
  "Your order has been successfully delivered!",
  { orderNumber: order.orderNumber }
);
```

### Frontend Integration
The notification system is automatically integrated into the app. Users will see:
- Notification badge in header showing unread count
- Notification screen with all notifications
- Automatic updates when order status changes

## Features

### Notification Types
- **Order**: Order status updates, delivery notifications
- **Offer**: Discounts, promotions, special offers
- **General**: App updates, welcome messages
- **Promotion**: Marketing campaigns, new products

### User Experience
- Unread notifications are highlighted
- Tap to mark as read
- Pull to refresh
- Infinite scroll pagination
- Navigation to relevant screens

### Performance
- Pagination to handle large numbers of notifications
- Database indexes for efficient queries
- Lazy loading of notification content

## Future Enhancements
- Push notifications integration
- Email notifications
- Notification preferences
- Notification categories
- Bulk actions (mark all as read, delete all)
- Notification templates
- Real-time notifications using WebSockets 