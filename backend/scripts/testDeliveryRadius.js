const { getDeliveryAvailability, DELIVERY_RADIUS_CONFIG } = require('../config/deliveryRadius');

// Test delivery radius functionality
console.log('Testing Delivery Radius Configuration');
console.log('=====================================');

// Test coordinates around Tirupattur Bus Stand
const testCoordinates = [
  {
    name: 'Tirupattur Bus Stand (Center)',
    latitude: 12.4962,
    longitude: 78.5696,
    expected: 'Should be available'
  },
  {
    name: 'Within 2km radius',
    latitude: 12.5100,
    longitude: 78.5800,
    expected: 'Should be available'
  },
  {
    name: 'Within 5km radius',
    latitude: 12.5300,
    longitude: 78.5900,
    expected: 'Should be available'
  },
  {
    name: 'Outside 5km radius',
    latitude: 12.5500,
    longitude: 78.6100,
    expected: 'Should NOT be available'
  },
  {
    name: 'Far outside service area',
    latitude: 12.6000,
    longitude: 78.7000,
    expected: 'Should NOT be available (outside service area)'
  }
];

// Mock shop data (located at Tirupattur Bus Stand)
const mockShop = {
  _id: 'test-shop-id',
  name: 'Test Shop',
  location: {
    type: 'Point',
    coordinates: [78.5696, 12.4962] // [longitude, latitude] - Tirupattur Bus Stand
  }
};

console.log('\nDelivery Radius Configuration:');
console.log(`Max Radius: ${DELIVERY_RADIUS_CONFIG.maxRadius}km`);
console.log(`Tirupattur Bus Stand: ${DELIVERY_RADIUS_CONFIG.center.latitude}, ${DELIVERY_RADIUS_CONFIG.center.longitude}`);
console.log(`Service Area Boundaries:`);
console.log(`  North: ${DELIVERY_RADIUS_CONFIG.boundaries.north}`);
console.log(`  South: ${DELIVERY_RADIUS_CONFIG.boundaries.south}`);
console.log(`  East: ${DELIVERY_RADIUS_CONFIG.boundaries.east}`);
console.log(`  West: ${DELIVERY_RADIUS_CONFIG.boundaries.west}`);

console.log('\nTesting Delivery Availability:');
console.log('==============================');

testCoordinates.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log(`   Coordinates: ${test.latitude}, ${test.longitude}`);
  console.log(`   Expected: ${test.expected}`);
  
  const availability = getDeliveryAvailability(
    test.latitude,
    test.longitude,
    mockShop
  );
  
  console.log(`   Result: ${availability.available ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   Message: ${availability.message}`);
  console.log(`   Distance: ${availability.distance}km`);
  console.log(`   Reason: ${availability.reason}`);
});

console.log('\n=====================================');
console.log('Test completed!');
