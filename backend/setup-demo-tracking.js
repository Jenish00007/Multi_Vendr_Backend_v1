const mongoose = require('mongoose');
const Order = require('./backend/model/order');
const DeliveryMan = require('./backend/model/deliveryman');
const User = require('./backend/model/user');
const Shop = require('./backend/model/shop');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/multivendor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
    setupDemoData();
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function setupDemoData() {
    try {
        console.log('Setting up demo data for live tracking...');

        // 1. Find or create a demo user
        let demoUser = await User.findOne({ email: 'demo.user@example.com' });
        if (!demoUser) {
            demoUser = await User.create({
                name: 'Demo User',
                email: 'demo.user@example.com',
                password: 'demo123456',
                phoneNumber: '+1234567890',
                addresses: [{
                    name: 'Demo User',
                    phone: '+1234567890',
                    house: '123',
                    street: 'Demo Street',
                    area: 'Demo Area',
                    city: 'Demo City',
                    state: 'Demo State',
                    country: 'Demo Country',
                    postalCode: '12345',
                    latitude: 12.9716,
                    longitude: 77.5946,
                    isDefault: true
                }]
            });
            console.log('Created demo user:', demoUser.email);
        }

        // 2. Find or create a demo shop
        let demoShop = await Shop.findOne({ name: 'Demo Restaurant' });
        if (!demoShop) {
            demoShop = await Shop.create({
                name: 'Demo Restaurant',
                email: 'demo@restaurant.com',
                password: 'demo123456',
                phoneNumber: '+0987654321',
                address: 'Demo Restaurant Address',
                latitude: 12.9616,
                longitude: 77.5846,
                description: 'Demo restaurant for testing',
                rating: 4.5,
                totalReviews: 100,
                isActive: true
            });
            console.log('Created demo shop:', demoShop.name);
        }

        // 3. Find or create a demo delivery person
        let demoDeliveryMan = await DeliveryMan.findOne({ email: 'demo.delivery@example.com' });
        if (!demoDeliveryMan) {
            demoDeliveryMan = await DeliveryMan.create({
                name: 'Demo Delivery Partner',
                email: 'demo.delivery@example.com',
                password: 'demo123456',
                phoneNumber: '+1122334455',
                address: 'Delivery Hub Address',
                vehicleType: 'bike',
                vehicleNumber: 'DEMO-1234',
                licenseNumber: 'DL-DEMO-2024',
                idProof: 'demo-id-proof.jpg',
                isApproved: true,
                isAvailable: true,
                currentLocation: {
                    type: 'Point',
                    coordinates: [77.5746, 12.9516] // Near Bangalore
                }
            });
            console.log('Created demo delivery person:', demoDeliveryMan.name);
        }

        // 4. Create a demo order with "picked_up" status for live tracking
        const existingOrder = await Order.findOne({ 
            'user.email': 'demo.user@example.com',
            status: { $in: ['picked_up', 'out_for_delivery'] }
        });

        if (!existingOrder) {
            const demoOrder = await Order.create({
                cart: [{
                    name: 'Demo Food Item',
                    price: 299,
                    quantity: 2,
                    image: 'https://via.placeholder.com/150',
                    shopName: 'Demo Restaurant'
                }],
                shippingAddress: {
                    name: 'Demo User',
                    phone: '+1234567890',
                    house: '123',
                    street: 'Demo Street',
                    area: 'Demo Area', 
                    city: 'Demo City',
                    state: 'Demo State',
                    country: 'Demo Country',
                    postalCode: '12345',
                    address: '123 Demo Street, Demo Area, Demo City - 12345',
                    latitude: 12.9716,
                    longitude: 77.5946
                },
                user: {
                    _id: demoUser._id,
                    name: demoUser.name,
                    email: demoUser.email,
                    phoneNumber: demoUser.phoneNumber
                },
                shop: demoShop._id,
                deliveryMan: demoDeliveryMan._id,
                totalPrice: 598,
                status: 'picked_up', // This status triggers live tracking
                paymentInfo: {
                    status: 'Succeeded',
                    type: 'cash_on_delivery',
                    id: 'DEMO_PAYMENT_' + Date.now()
                },
                userLocation: {
                    latitude: 12.9716,
                    longitude: 77.5946,
                    deliveryAddress: '123 Demo Street, Demo Area, Demo City - 12345'
                },
                otp: Math.floor(100000 + Math.random() * 900000).toString(),
                deliveredAt: null
            });

            console.log('Created demo order:', demoOrder._id);
            console.log('Order Status:', demoOrder.status);
            console.log('Assigned Delivery Man:', demoDeliveryMan.name);
        } else {
            console.log('Demo order already exists:', existingOrder._id);
            console.log('Order Status:', existingOrder.status);
        }

        // 5. Update delivery person location to simulate movement
        await DeliveryMan.findByIdAndUpdate(demoDeliveryMan._id, {
            currentLocation: {
                type: 'Point',
                coordinates: [77.5846, 12.9616] // Moving towards customer
            }
        });

        console.log('\n=== DEMO SETUP COMPLETE ===');
        console.log('User App Login: demo.user@example.com / demo123456');
        console.log('Delivery App Login: demo.delivery@example.com / demo123456');
        console.log('Order Status: picked_up (triggers live tracking)');
        console.log('Delivery person location updated for testing');
        console.log('\nYou can now test live tracking on both apps!');

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('Error setting up demo data:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}
