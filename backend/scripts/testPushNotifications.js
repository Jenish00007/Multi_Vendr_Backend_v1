const mongoose = require('mongoose');
const {
  sendPushNotification,
  sendOrderStatusNotification,
  sendPromotionalNotification,
  sendDeliveryNotification
} = require('../utils/pushNotification');
require('dotenv').config({ path: '../config/.env' });

// Connect to database
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Test push notification
const testPushNotification = async (testToken) => {
  try {
    console.log('Testing push notification...');
    
    const result = await sendPushNotification(
      testToken,
      'Test Notification',
      'This is a test notification from the backend',
      {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    );
    
    console.log('Push notification result:', result);
    
    if (result.success) {
      console.log('✅ Push notification test successful!');
    } else {
      console.log('❌ Push notification test failed:', result.error);
    }
    
  } catch (error) {
    console.error('Error testing push notification:', error);
  }
};

// Test order status notification
const testOrderStatusNotification = async (testToken) => {
  try {
    console.log('Testing orderConfirmed notification...');
    
    const result = await sendPushNotification(
      testToken,
      'Order Confirmed',
      'Your order has been confirmed by the vendor!',
      { type: 'orderConfirmed', orderId: 'TEST_ORDER_ID' }
    );
    
    console.log('Order confirmed notification result:', result);
    
    if (result.success) {
      console.log('✅ Order confirmed notification test successful!');
    } else {
      console.log('❌ Order confirmed notification test failed:', result.error);
    }
    
  } catch (error) {
    console.error('Error testing order confirmed notification:', error);
  }
};

const testDeliveryAssignedNotification = async (testToken) => {
  try {
    console.log('Testing deliveryAssigned notification...');

    const result = await sendPushNotification(
      testToken,
      'Delivery Partner Assigned',
      'A delivery partner is on the way to pick up your order!',
      { type: 'deliveryAssigned', orderId: 'TEST_ORDER_ID' }
    );

    console.log('Delivery assigned notification result:', result);

    if (result.success) {
      console.log('✅ Delivery assigned notification test successful!');
    } else {
      console.log('❌ Delivery assigned notification test failed:', result.error);
    }
  } catch (error) {
    console.error('Error testing delivery assigned notification:', error);
  }
};

const testDeliveryNearbyNotification = async (testToken) => {
  try {
    console.log('Testing deliveryNearby notification...');

    const result = await sendPushNotification(
      testToken,
      'Almost There!',
      'Your delivery partner will arrive in about 5 minutes!',
      { type: 'deliveryNearby', orderId: 'TEST_ORDER_ID' }
    );

    console.log('Delivery nearby notification result:', result);

    if (result.success) {
      console.log('✅ Delivery nearby notification test successful!');
    } else {
      console.log('❌ Delivery nearby notification test failed:', result.error);
    }
  } catch (error) {
    console.error('Error testing delivery nearby notification:', error);
  }
};

const testDeliveryArrivedNotification = async (testToken) => {
  try {
    console.log('Testing deliveryArrived notification...');

    const result = await sendPushNotification(
      testToken,
      'Delivery Arrived',
      'Your delivery partner has reached your destination.',
      { type: 'deliveryArrived', orderId: 'TEST_ORDER_ID' }
    );

    console.log('Delivery arrived notification result:', result);

    if (result.success) {
      console.log('✅ Delivery arrived notification test successful!');
    } else {
      console.log('❌ Delivery arrived notification test failed:', result.error);
    }
  } catch (error) {
    console.error('Error testing delivery arrived notification:', error);
  }
};

const testPaymentReceivedNotification = async (testToken) => {
  try {
    console.log('Testing payment_received notification...');

    const result = await sendPushNotification(
      testToken,
      'Payment Received!',
      'Payment received for your order.',
      { type: 'payment_received', orderId: 'TEST_ORDER_ID', amount: '100' }
    );

    console.log('Payment received notification result:', result);

    if (result.success) {
      console.log('✅ Payment received notification test successful!');
    } else {
      console.log('❌ Payment received notification test failed:', result.error);
    }
  } catch (error) {
    console.error('Error testing payment received notification:', error);
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting push notification tests...\n');

  const testToken = process.argv[2] || process.env.PUSH_TOKEN;
  if (!testToken) {
    console.error('Missing push token. Provide as CLI arg or PUSH_TOKEN env var.');
    process.exit(1);
  }
  
  console.log('\n📱 Testing basic push notification...');
  await testPushNotification(testToken);
  
  console.log('\n📦 Testing order confirmed notification...');
  await testOrderStatusNotification(testToken);

  console.log('\n🚚 Testing delivery assigned notification...');
  await testDeliveryAssignedNotification(testToken);

  console.log('\n📍 Testing delivery nearby notification...');
  await testDeliveryNearbyNotification(testToken);

  console.log('\n🏁 Testing delivery arrived notification...');
  await testDeliveryArrivedNotification(testToken);

  console.log('\n💳 Testing payment received notification...');
  await testPaymentReceivedNotification(testToken);
  
  console.log('\n✅ All tests completed!');
  
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Run tests
runTests(); 