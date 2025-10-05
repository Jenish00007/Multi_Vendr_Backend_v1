const mongoose = require('mongoose');
const { sendNewOrderNotificationToDeliverymen } = require('../utils/pushNotification');
const Order = require('../model/order');
const DeliveryMan = require('../model/deliveryman');
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

// Test new order notification to deliverymen
const testNewOrderNotification = async () => {
  try {
    console.log('Testing new order notification to deliverymen...');
    
    // First, let's check if there are any available deliverymen
    const availableDeliverymen = await DeliveryMan.find({
      isAvailable: true,
      isApproved: true,
      expoPushToken: { $exists: true, $ne: null, $ne: '' }
    }).select('expoPushToken name email');

    console.log(`Found ${availableDeliverymen.length} available deliverymen with push tokens:`);
    availableDeliverymen.forEach((dm, index) => {
      console.log(`  ${index + 1}. ${dm.name} (${dm.email}) - Token: ${dm.expoPushToken ? 'Present' : 'Missing'}`);
    });

    if (availableDeliverymen.length === 0) {
      console.log('❌ No available deliverymen found with push tokens. Please add some deliverymen with valid expoPushToken first.');
      return;
    }

    // Create a mock order for testing
    const mockOrder = {
      _id: new mongoose.Types.ObjectId(),
      cart: [
        {
          product: new mongoose.Types.ObjectId(),
          shopId: {
            name: 'Test Shop'
          },
          quantity: 2,
          price: 100,
          name: 'Test Product'
        }
      ],
      totalPrice: 200,
      userLocation: {
        latitude: 28.6139,
        longitude: 77.2090
      },
      shippingAddress: {
        address: '123 Test Street, Test City',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345'
      },
      user: {
        name: 'Test User',
        phone: '1234567890'
      }
    };

    console.log('\n📦 Sending notification for mock order:');
    console.log(`   Order ID: ${mockOrder._id}`);
    console.log(`   Shop: ${mockOrder.cart[0].shopId.name}`);
    console.log(`   Total Price: ₹${mockOrder.totalPrice}`);
    console.log(`   Items: ${mockOrder.cart.reduce((total, item) => total + item.quantity, 0)}`);

    const result = await sendNewOrderNotificationToDeliverymen(mockOrder);
    
    console.log('\n📱 Push notification result:', result);
    
    if (result.success) {
      console.log('✅ New order notification test successful!');
      console.log(`   Sent to ${result.successCount || 0} deliverymen`);
      if (result.errorCount > 0) {
        console.log(`   ${result.errorCount} notifications failed`);
      }
    } else {
      console.log('❌ New order notification test failed:', result.error);
    }
    
  } catch (error) {
    console.error('Error testing new order notification:', error);
  }
};

// Test with real order from database
const testWithRealOrder = async () => {
  try {
    console.log('\n🔍 Testing with real order from database...');
    
    // Get the most recent order
    const recentOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .populate('cart.shopId', 'name')
      .populate('user', 'name phone');

    if (!recentOrder) {
      console.log('❌ No orders found in database. Please create an order first.');
      return;
    }

    console.log(`Using real order: ${recentOrder._id}`);
    console.log(`   Shop: ${recentOrder.cart[0]?.shopId?.name || 'Unknown'}`);
    console.log(`   Total Price: ₹${recentOrder.totalPrice}`);
    console.log(`   Items: ${recentOrder.cart.reduce((total, item) => total + item.quantity, 0)}`);

    const result = await sendNewOrderNotificationToDeliverymen(recentOrder);
    
    console.log('\n📱 Real order notification result:', result);
    
    if (result.success) {
      console.log('✅ Real order notification test successful!');
      console.log(`   Sent to ${result.successCount || 0} deliverymen`);
    } else {
      console.log('❌ Real order notification test failed:', result.error);
    }
    
  } catch (error) {
    console.error('Error testing with real order:', error);
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting new order notification tests...\n');
  
  await connectDatabase();
  
  console.log('📱 Testing new order notification with mock data...');
  await testNewOrderNotification();
  
  console.log('\n📦 Testing with real order from database...');
  await testWithRealOrder();
  
  console.log('\n✅ All tests completed!');
  
  // Close database connection
  await mongoose.connection.close();
  console.log('Database connection closed');
  
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Run tests
runTests();
