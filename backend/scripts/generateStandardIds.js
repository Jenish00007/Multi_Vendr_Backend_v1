/**
 * Migration Script: Generate Standardized IDs for Existing Data
 * 
 * This script generates standardized IDs (userId, shopId, orderId) for all existing
 * records in MongoDB that don't have them yet.
 * 
 * Usage: node backend/scripts/generateStandardIds.js
 */

const mongoose = require("mongoose");
const path = require("path");
const User = require("../model/user");
const Shop = require("../model/shop");
const Order = require("../model/order");

// Load environment variables from config/.env (same as server.js)
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: path.join(__dirname, "../config/.env"),
  });
}

// Fallback to root .env if config/.env doesn't exist
if (!process.env.MONGODB_URI) {
  require("dotenv").config({
    path: path.join(__dirname, "../.env"),
  });
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGODB_URL;
    
    if (!mongoUri) {
      console.error("❌ MongoDB connection URI not found!");
      console.error("Please set MONGODB_URI in your .env file (config/.env or .env)");
      console.error("Example: MONGODB_URI=mongodb://localhost:27017/your_database");
      process.exit(1);
    }
    
    console.log(`🔌 Connecting to MongoDB...`);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
    console.log(`   Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

/**
 * Get the highest sequence number from existing IDs
 */
const getHighestSequenceNumber = async (Model, idField) => {
  try {
    // Find the document with the highest sequence number
    const lastDoc = await Model.findOne({
      [idField]: { $exists: true, $ne: null, $ne: "" }
    })
      .sort({ [idField]: -1 })
      .select(idField)
      .lean();

    if (!lastDoc || !lastDoc[idField]) {
      return 0; // No existing IDs
    }

    // Extract the number from the last ID (e.g., 'USR-000123' -> 123)
    const lastId = lastDoc[idField];
    const match = lastId.match(/-(\d+)$/);
    
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    return 0; // Fallback
  } catch (error) {
    console.error(`Error getting highest sequence for ${Model.modelName}:`, error);
    return 0;
  }
};

/**
 * Generate standardized IDs for all users
 */
const generateUserIds = async () => {
  try {
    console.log("\n📋 Processing Users...");
    
    // Get the highest existing sequence number
    const highestSeq = await getHighestSequenceNumber(User, 'userId');
    console.log(`Current highest User ID sequence: ${highestSeq > 0 ? `USR-${highestSeq.toString().padStart(6, '0')}` : 'None'}`);
    
    // Find all users without userId
    const usersWithoutId = await User.find({ 
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: "" }
      ]
    }).sort({ createdAt: 1 }); // Sort by creation date for consistent ordering
    
    console.log(`Found ${usersWithoutId.length} users without standardized ID`);
    
    if (usersWithoutId.length === 0) {
      console.log("✅ All users already have standardized IDs");
      return { updated: 0, skipped: 0 };
    }
    
    let updated = 0;
    let skipped = 0;
    let currentSeq = highestSeq; // Start from the highest existing sequence
    
    for (const user of usersWithoutId) {
      try {
        // Increment sequence and generate new userId
        currentSeq++;
        const newUserId = `USR-${currentSeq.toString().padStart(6, '0')}`;
        
        // Double-check if this userId already exists (safety check)
        const existingUser = await User.findOne({ userId: newUserId });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          console.log(`⚠️  User ID ${newUserId} already exists, skipping user ${user._id}`);
          skipped++;
          currentSeq--; // Don't increment for skipped
          continue;
        }
        
        // Update user with new userId
        user.userId = newUserId;
        await user.save({ validateBeforeSave: false });
        
        updated++;
        if (updated % 10 === 0) {
          console.log(`  ✓ Updated ${updated} users... (Last ID: ${newUserId})`);
        }
      } catch (error) {
        console.error(`❌ Error updating user ${user._id}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`✅ Users: ${updated} updated, ${skipped} skipped`);
    if (updated > 0) {
      console.log(`   Last generated User ID: USR-${currentSeq.toString().padStart(6, '0')}`);
    }
    return { updated, skipped };
  } catch (error) {
    console.error("❌ Error generating user IDs:", error);
    return { updated: 0, skipped: 0, error: error.message };
  }
};

/**
 * Generate standardized IDs for all shops
 */
const generateShopIds = async () => {
  try {
    console.log("\n📋 Processing Shops...");
    
    // Get the highest existing sequence number
    const highestSeq = await getHighestSequenceNumber(Shop, 'shopId');
    console.log(`Current highest Shop ID sequence: ${highestSeq > 0 ? `SHP-${highestSeq.toString().padStart(6, '0')}` : 'None'}`);
    
    // Find all shops without shopId
    const shopsWithoutId = await Shop.find({ 
      $or: [
        { shopId: { $exists: false } },
        { shopId: null },
        { shopId: "" }
      ]
    }).sort({ createdAt: 1 }); // Sort by creation date for consistent ordering
    
    console.log(`Found ${shopsWithoutId.length} shops without standardized ID`);
    
    if (shopsWithoutId.length === 0) {
      console.log("✅ All shops already have standardized IDs");
      return { updated: 0, skipped: 0 };
    }
    
    let updated = 0;
    let skipped = 0;
    let currentSeq = highestSeq; // Start from the highest existing sequence
    
    for (const shop of shopsWithoutId) {
      try {
        // Increment sequence and generate new shopId
        currentSeq++;
        const newShopId = `SHP-${currentSeq.toString().padStart(6, '0')}`;
        
        // Double-check if this shopId already exists (safety check)
        const existingShop = await Shop.findOne({ shopId: newShopId });
        if (existingShop && existingShop._id.toString() !== shop._id.toString()) {
          console.log(`⚠️  Shop ID ${newShopId} already exists, skipping shop ${shop._id}`);
          skipped++;
          currentSeq--; // Don't increment for skipped
          continue;
        }
        
        // Update shop with new shopId
        shop.shopId = newShopId;
        await shop.save({ validateBeforeSave: false });
        
        updated++;
        if (updated % 10 === 0) {
          console.log(`  ✓ Updated ${updated} shops... (Last ID: ${newShopId})`);
        }
      } catch (error) {
        console.error(`❌ Error updating shop ${shop._id}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`✅ Shops: ${updated} updated, ${skipped} skipped`);
    if (updated > 0) {
      console.log(`   Last generated Shop ID: SHP-${currentSeq.toString().padStart(6, '0')}`);
    }
    return { updated, skipped };
  } catch (error) {
    console.error("❌ Error generating shop IDs:", error);
    return { updated: 0, skipped: 0, error: error.message };
  }
};

/**
 * Generate standardized IDs for all orders
 */
const generateOrderIds = async () => {
  try {
    console.log("\n📋 Processing Orders...");
    
    // Get the highest existing sequence number
    const highestSeq = await getHighestSequenceNumber(Order, 'orderId');
    console.log(`Current highest Order ID sequence: ${highestSeq > 0 ? `ORD-${highestSeq.toString().padStart(6, '0')}` : 'None'}`);
    
    // Find all orders without orderId
    const ordersWithoutId = await Order.find({ 
      $or: [
        { orderId: { $exists: false } },
        { orderId: null },
        { orderId: "" }
      ]
    }).sort({ createdAt: 1 }); // Sort by creation date for consistent ordering
    
    console.log(`Found ${ordersWithoutId.length} orders without standardized ID`);
    
    if (ordersWithoutId.length === 0) {
      console.log("✅ All orders already have standardized IDs");
      return { updated: 0, skipped: 0 };
    }
    
    let updated = 0;
    let skipped = 0;
    let currentSeq = highestSeq; // Start from the highest existing sequence
    
    for (const order of ordersWithoutId) {
      try {
        // Increment sequence and generate new orderId
        currentSeq++;
        const newOrderId = `ORD-${currentSeq.toString().padStart(6, '0')}`;
        
        // Double-check if this orderId already exists (safety check)
        const existingOrder = await Order.findOne({ orderId: newOrderId });
        if (existingOrder && existingOrder._id.toString() !== order._id.toString()) {
          console.log(`⚠️  Order ID ${newOrderId} already exists, skipping order ${order._id}`);
          skipped++;
          currentSeq--; // Don't increment for skipped
          continue;
        }
        
        // Update order with new orderId
        order.orderId = newOrderId;
        await order.save({ validateBeforeSave: false });
        
        updated++;
        if (updated % 10 === 0) {
          console.log(`  ✓ Updated ${updated} orders... (Last ID: ${newOrderId})`);
        }
      } catch (error) {
        console.error(`❌ Error updating order ${order._id}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`✅ Orders: ${updated} updated, ${skipped} skipped`);
    if (updated > 0) {
      console.log(`   Last generated Order ID: ORD-${currentSeq.toString().padStart(6, '0')}`);
    }
    return { updated, skipped };
  } catch (error) {
    console.error("❌ Error generating order IDs:", error);
    return { updated: 0, skipped: 0, error: error.message };
  }
};

/**
 * Main execution function
 */
const main = async () => {
  try {
    console.log("🚀 Starting Standardized ID Generation for Existing Data\n");
    console.log("=" .repeat(60));
    
    // Connect to database
    await connectDB();
    
    // Generate IDs for each entity type
    const userResults = await generateUserIds();
    const shopResults = await generateShopIds();
    const orderResults = await generateOrderIds();
    
    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`Users:   ${userResults.updated} updated, ${userResults.skipped} skipped`);
    console.log(`Shops:   ${shopResults.updated} updated, ${shopResults.skipped} skipped`);
    console.log(`Orders:  ${orderResults.updated} updated, ${orderResults.skipped} skipped`);
    console.log("\n✅ Migration completed successfully!");
    
    // Close database connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { generateUserIds, generateShopIds, generateOrderIds };

