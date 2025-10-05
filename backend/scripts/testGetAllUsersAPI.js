const mongoose = require('mongoose');
const User = require('../model/user');

// Database connection string
const DB_URI = process.env.MONGODB_URI || "mongodb+srv://qaudsinfo:Qauds123@cluster0.nyfuhwt.mongodb.net/qauds?retryWrites=true&w=majority&appName=Cluster0";

async function testGetAllUsersAPI() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connected successfully!');

    // Test the query logic that would be used in the API
    console.log('\n📊 Testing get-all-users API logic...');

    // Simulate query parameters
    const page = 1;
    const limit = 10;
    const search = '';
    const sortBy = 'createdAt';
    const sortOrder = -1;

    // Build search query (same as in API)
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with pagination and search (same as in API)
    const users = await User.find(searchQuery)
      .select('-password -otp') // Exclude sensitive fields
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    // Process users data to match frontend expectations (same as in API)
    const processedUsers = users.map(user => ({
      _id: user._id,
      name: user.name || 'Unknown User',
      email: user.email || '',
      phone: user.phoneNumber || '',
      phoneNumber: user.phoneNumber || '',
      profileImage: user.avatar || null,
      avatar: user.avatar || null,
      createdAt: user.createdAt,
      isActive: user.isActive !== false, // Default to true if not specified
      lastLogin: user.lastLogin || null,
      role: user.role || 'user',
      isPhoneVerified: user.isPhoneVerified || false,
      pushToken: user.pushToken || null
    }));

    console.log(`📋 Found ${totalUsers} total users`);
    console.log(`📄 Showing page ${page} of ${totalPages} (${users.length} users)`);

    if (processedUsers.length > 0) {
      console.log('\n👥 Sample user data (as returned by API):');
      const sampleUser = processedUsers[0];
      
      console.log('User ID:', sampleUser._id);
      console.log('Name:', sampleUser.name);
      console.log('Email:', sampleUser.email);
      console.log('Phone:', sampleUser.phone);
      console.log('Role:', sampleUser.role);
      console.log('Created At:', sampleUser.createdAt);
      console.log('Is Active:', sampleUser.isActive);
      console.log('Is Phone Verified:', sampleUser.isPhoneVerified);
      
      console.log('\n🔍 All fields in response:');
      Object.keys(sampleUser).forEach(field => {
        console.log(`- ${field}: ${sampleUser[field]}`);
      });

      console.log('\n✅ Field Presence Check:');
      console.log('_id exists:', sampleUser.hasOwnProperty('_id'));
      console.log('name exists:', sampleUser.hasOwnProperty('name'));
      console.log('email exists:', sampleUser.hasOwnProperty('email'));
      console.log('phone exists:', sampleUser.hasOwnProperty('phone'));
      console.log('profileImage exists:', sampleUser.hasOwnProperty('profileImage'));
      console.log('createdAt exists:', sampleUser.hasOwnProperty('createdAt'));
      console.log('isActive exists:', sampleUser.hasOwnProperty('isActive'));
    }

    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const searchTerm = 'test';
    const searchQueryTest = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phoneNumber: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const searchResults = await User.find(searchQueryTest).select('-password -otp');
    console.log(`🔍 Search for "${searchTerm}" returned ${searchResults.length} results`);

    // Test pagination
    console.log('\n📄 Testing pagination...');
    const page2 = 2;
    const skip2 = (page2 - 1) * limit;
    const usersPage2 = await User.find(searchQuery)
      .select('-password -otp')
      .sort({ [sortBy]: sortOrder })
      .skip(skip2)
      .limit(limit);

    console.log(`📄 Page 2 would return ${usersPage2.length} users`);

    console.log('\n✅ API logic test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the function
testGetAllUsersAPI();
