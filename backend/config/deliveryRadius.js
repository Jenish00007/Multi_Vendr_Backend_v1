// Delivery radius configuration for Tirupattur Bus Stand
const DELIVERY_RADIUS_CONFIG = {
  // Tirupattur Bus Stand coordinates (center point)
  center: {
    latitude: 12.4962, // Tirupattur Bus Stand Latitude
    longitude: 78.5696 // Tirupattur Bus Stand Longitude
  },
  // Maximum delivery radius in kilometers
  maxRadius: 5, // 5km radius from Tirupattur Bus Stand
  // Service area boundaries (approximate 5km radius)
  boundaries: {
    north: 12.5412, // 12.4962 + 0.045 (5km north)
    south: 12.4512, // 12.4962 - 0.045 (5km south)
    east: 78.6146,  // 78.5696 + 0.045 (5km east)
    west: 78.5246   // 78.5696 - 0.045 (5km west)
  }
};

/**
 * Check if a location is within the delivery radius
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} shopLat - Shop's latitude
 * @param {number} shopLng - Shop's longitude
 * @param {number} maxRadius - Maximum delivery radius in km (default: 10)
 * @returns {Object} - { isWithinRadius: boolean, distance: number, message: string }
 */
const checkDeliveryRadius = (userLat, userLng, shopLat, shopLng, maxRadius = DELIVERY_RADIUS_CONFIG.maxRadius) => {
  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(shopLat - userLat);
  const dLng = toRad(shopLng - userLng);
  const lat1 = toRad(userLat);
  const lat2 = toRad(shopLat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  const isWithinRadius = distance <= maxRadius;
  
  let message = '';
  if (isWithinRadius) {
    message = `Delivery available (${distance.toFixed(1)}km from Tirupattur Bus Stand)`;
  } else {
    message = `Not available for your location `;
  }

  return {
    isWithinRadius,
    distance: parseFloat(distance.toFixed(2)),
    message
  };
};

/**
 * Check if user location is within district boundaries
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @returns {Object} - { isWithinDistrict: boolean, message: string }
 */
const checkDistrictBoundaries = (userLat, userLng) => {
  const { boundaries } = DELIVERY_RADIUS_CONFIG;
  
  const isWithinDistrict = (
    userLat >= boundaries.south &&
    userLat <= boundaries.north &&
    userLng >= boundaries.west &&
    userLng <= boundaries.east
  );

  let message = '';
  if (isWithinDistrict) {
    message = 'Location is within Tirupattur service area';
  } else {
    message = 'Location is outside Tirupattur service area';
  }

  return {
    isWithinDistrict,
    message
  };
};

/**
 * Get delivery availability for a shop
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {Object} shop - Shop object with location
 * @returns {Object} - Delivery availability information
 */
const getDeliveryAvailability = (userLat, userLng, shop) => {
  if (!shop || !shop.location || !shop.location.coordinates) {
    return {
      available: false,
      message: 'Shop location not available',
      distance: null
    };
  }

  const [shopLng, shopLat] = shop.location.coordinates;
  
  // First check if user is within Tirupattur service area
  const districtCheck = checkDistrictBoundaries(userLat, userLng);
  if (!districtCheck.isWithinDistrict) {
    return {
      available: false,
      message: 'Not available for your location. ',
      distance: null,
      reason: 'outside_service_area'
    };
  }

  // Then check delivery radius
  const radiusCheck = checkDeliveryRadius(userLat, userLng, shopLat, shopLng);
  
  return {
    available: radiusCheck.isWithinRadius,
    message: radiusCheck.message,
    distance: radiusCheck.distance,
    reason: radiusCheck.isWithinRadius ? 'available' : 'outside_radius'
  };
};

// Helper function to convert degrees to radians
const toRad = (value) => {
  return (value * Math.PI) / 180;
};

module.exports = {
  DELIVERY_RADIUS_CONFIG,
  checkDeliveryRadius,
  checkDistrictBoundaries,
  getDeliveryAvailability
};
