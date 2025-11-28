/**
 * Utility functions to generate standardized IDs for Users, Shops, and Orders
 * Format: PREFIX-XXXXXX (e.g., USR-000001, SHP-000001, ORD-000001)
 */

/**
 * Generate a standardized ID with prefix and sequential number
 * @param {String} prefix - Prefix for the ID (e.g., 'USR', 'SHP', 'ORD')
 * @param {Number} sequenceNumber - Sequential number to format
 * @param {Number} padding - Number of digits to pad (default: 6)
 * @returns {String} Formatted ID (e.g., 'USR-000001')
 */
const generateStandardId = (prefix, sequenceNumber, padding = 6) => {
  const paddedNumber = sequenceNumber.toString().padStart(padding, '0');
  return `${prefix}-${paddedNumber}`;
};

/**
 * Get the next sequence number for a given model
 * @param {mongoose.Model} Model - Mongoose model
 * @param {String} idField - Field name that stores the standard ID
 * @returns {Promise<Number>} Next sequence number
 */
const getNextSequenceNumber = async (Model, idField) => {
  try {
    // Find the document with the highest sequence number
    // Only consider documents that have a valid idField (not null, not empty)
    const lastDoc = await Model.findOne({
      [idField]: { $exists: true, $ne: null, $ne: "" }
    })
      .sort({ [idField]: -1 })
      .select(idField)
      .lean();

    if (!lastDoc || !lastDoc[idField]) {
      // No existing IDs found, start from 1
      return 1;
    }

    // Extract the number from the last ID (e.g., 'USR-000123' -> 123)
    const lastId = lastDoc[idField];
    const match = lastId.match(/-(\d+)$/);
    
    if (match && match[1]) {
      const lastSeq = parseInt(match[1], 10);
      // Return next sequence number
      return lastSeq + 1;
    }

    // Fallback: start from 1 if parsing fails
    return 1;
  } catch (error) {
    console.error(`Error getting next sequence for ${Model.modelName}:`, error);
    return 1; // Fallback to 1 on error
  }
};

/**
 * Generate User ID (USR-XXXXXX)
 * @param {mongoose.Model} UserModel - User mongoose model
 * @returns {Promise<String>} Generated user ID
 */
const generateUserId = async (UserModel) => {
  const nextSeq = await getNextSequenceNumber(UserModel, 'userId');
  return generateStandardId('USR', nextSeq);
};

/**
 * Generate Shop ID (SHP-XXXXXX)
 * @param {mongoose.Model} ShopModel - Shop mongoose model
 * @returns {Promise<String>} Generated shop ID
 */
const generateShopId = async (ShopModel) => {
  const nextSeq = await getNextSequenceNumber(ShopModel, 'shopId');
  return generateStandardId('SHP', nextSeq);
};

/**
 * Generate Order ID (ORD-XXXXXX)
 * @param {mongoose.Model} OrderModel - Order mongoose model
 * @returns {Promise<String>} Generated order ID
 */
const generateOrderId = async (OrderModel) => {
  const nextSeq = await getNextSequenceNumber(OrderModel, 'orderId');
  return generateStandardId('ORD', nextSeq);
};

module.exports = {
  generateStandardId,
  getNextSequenceNumber,
  generateUserId,
  generateShopId,
  generateOrderId,
};

