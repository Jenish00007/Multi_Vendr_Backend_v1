# User Order Cancel API Documentation

## Overview
The User Order Cancel API allows authenticated users to cancel their orders under specific conditions. This API handles order cancellation, inventory restoration, and notification dispatch.

## Endpoint
```
PUT /v2/order/cancel-order/:id
```

## Authentication
- **Required**: Yes
- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <user_token>`

## Parameters

### Path Parameters
- `id` (string, required): The order ID to cancel

### Request Body
```json
{
  "cancellationReason": "string (optional)"
}
```

#### Request Body Fields
- `cancellationReason` (string, optional): Reason for cancellation. Defaults to "Cancelled by user" if not provided.

## Request Example
```bash
curl -X PUT "http://localhost:8000/v2/order/cancel-order/60f7b3b3b3b3b3b3b3b3b3b3" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cancellationReason": "Changed my mind"
  }'
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "status": "Cancelled",
    "totalPrice": 150.00,
    "createdAt": "2023-07-20T10:30:00.000Z",
    "cancelledAt": "2023-07-20T11:00:00.000Z",
    "cancellationReason": "Changed my mind",
    "itemsQty": 3,
    "items": [
      {
        "_id": "item_id_1",
        "name": "Product Name",
        "quantity": 2,
        "price": 50.00,
        "image": "product_image_url",
        "shopName": "Shop Name"
      }
    ],
    "shippingAddress": {
      "address": "123 Main St",
      "city": "City",
      "state": "State",
      "zipCode": "12345",
      "country": "Country"
    },
    "paymentInfo": {
      "type": "COD",
      "status": "Pending"
    },
    "userLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "deliveryAddress": "123 Main St, City"
    }
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Order cannot be cancelled in its current state: Delivered. Only orders in \"Processing\" or \"Transferred to delivery partner\" status can be cancelled."
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied, token is missing or invalid"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not authorized to cancel this order"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Order not found with this id"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Business Rules

### Order Cancellation Eligibility
Orders can only be cancelled if they are in one of the following states:
- `Processing`: Order is being prepared
- `Transferred to delivery partner`: Order has been transferred to delivery partner but not yet out for delivery

### Orders That Cannot Be Cancelled
- `Delivered`: Order has already been delivered
- `Out for delivery`: Order is currently being delivered
- `Cancelled`: Order is already cancelled
- `Refund Success`: Order has been refunded

### Inventory Management
- If an order is cancelled after being "Transferred to delivery partner", the product stock is automatically restored
- The `sold_out` count is decreased by the cancelled quantities
- Product stock is increased by the cancelled quantities

### Notification System
- A cancellation notification is sent to the user
- Notification includes order details and cancellation reason
- Notification is created even if the order update succeeds

## Error Handling

### Validation Errors
- Invalid order ID format
- Missing authentication token
- Invalid user authorization

### Business Logic Errors
- Order not found
- Order already cancelled
- Order in non-cancellable state
- User not authorized to cancel the order

### System Errors
- Database connection issues
- Notification service failures
- Product inventory update failures

## Testing

### Test Script
A test script is provided at `backend/test-cancel-api.js` to verify the API functionality.

### Test Cases
1. **Valid cancellation**: Cancel an order in "Processing" status
2. **Invalid order ID**: Test with non-existent order ID
3. **Unauthorized access**: Test without authentication token
4. **Already cancelled**: Try to cancel an already cancelled order
5. **Non-cancellable status**: Try to cancel a "Delivered" order

### Prerequisites for Testing
1. Update `TEST_ORDER_ID` with a valid order ID from your database
2. Update `USER_TOKEN` with a valid user authentication token
3. Ensure the server is running on the specified port

## Security Considerations

### Authentication
- All requests must include a valid user authentication token
- Users can only cancel their own orders

### Authorization
- Order ownership is verified before allowing cancellation
- Cross-user order cancellation is prevented

### Data Validation
- Order ID format validation
- Request body validation
- Input sanitization for cancellation reasons

## Related APIs

### Get User Orders
```
GET /v2/order/get-all-orders
```
Used to retrieve user's orders for cancellation testing.

### Get Order Details
```
GET /v2/order/get-order/:id
```
Used to get detailed order information before cancellation.

## Database Schema Updates

The following fields have been added to the Order model:
- `cancelledAt`: Date when the order was cancelled
- `cancellationReason`: Reason for cancellation
- `cancelledBy`: Reference to the user who cancelled the order
- `ignored_by`: Array of deliverymen who ignored the order
- `delivery_instruction`: Delivery instructions for the order
- `store`: Reference to the shop/store

## Monitoring and Logging

### Logged Events
- Order cancellation attempts
- Successful cancellations
- Failed cancellation attempts with reasons
- Inventory update operations
- Notification dispatch status

### Metrics to Monitor
- Cancellation rate by order status
- Average time between order creation and cancellation
- Failed cancellation attempts
- Inventory restoration success rate
- Notification delivery success rate
