const express = require("express");
const router = express.Router();
const User = require("../model/user");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Get user addresses with city filtering
router.get(
  "/user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { city, page = 1, limit = 10 } = req.query;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      let addresses = user.addresses || [];

      // Filter by city if provided
      if (city) {
        addresses = addresses.filter(address => {
          const addressString = `${address.address || ''} ${address.city || ''} ${address.address1 || ''} ${address.address2 || ''}`.toLowerCase();
          return addressString.includes(city.toLowerCase());
        });
      }

      // Sort by recently used/created
      addresses.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || new Date(0);
        const dateB = b.updatedAt || b.createdAt || new Date(0);
        return new Date(dateB) - new Date(dateA);
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedAddresses = addresses.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        addresses: paginatedAddresses,
        total: addresses.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(addresses.length / limit)
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create or update address with city validation
router.post(
  "/user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        address1,
        address2,
        city,
        state,
        zipCode,
        country,
        addressType,
        contactPersonName,
        contactPersonNumber,
        latitude,
        longitude,
        isDefault
      } = req.body;

      const userId = req.user.id;

      // Validate required fields
      if (!address1 || !city || !contactPersonName || !contactPersonNumber) {
        return next(new ErrorHandler("Please fill all required fields", 400));
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const newAddress = {
        address1,
        address2,
        city,
        state,
        zipCode,
        country: country || 'India',
        addressType: addressType || 'home',
        contactPersonName,
        contactPersonNumber,
        latitude,
        longitude,
        isDefault: isDefault || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // If setting as default, unset other default addresses
      if (isDefault) {
        user.addresses = user.addresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
      }

      user.addresses.push(newAddress);
      await user.save();

      res.status(201).json({
        success: true,
        message: "Address added successfully",
        address: newAddress
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update address
router.put(
  "/user-addresses/:addressId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        return next(new ErrorHandler("Address not found", 404));
      }

      // If setting as default, unset other default addresses
      if (updateData.isDefault) {
        user.addresses = user.addresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
      }

      // Update the address
      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex],
        ...updateData,
        updatedAt: new Date()
      };

      await user.save();

      res.status(200).json({
        success: true,
        message: "Address updated successfully",
        address: user.addresses[addressIndex]
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete address
router.delete(
  "/user-addresses/:addressId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        return next(new ErrorHandler("Address not found", 404));
      }

      user.addresses.splice(addressIndex, 1);
      await user.save();

      res.status(200).json({
        success: true,
        message: "Address deleted successfully"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Set default address
router.put(
  "/user-addresses/:addressId/set-default",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Unset all default addresses
      user.addresses = user.addresses.map(addr => ({
        ...addr,
        isDefault: false
      }));

      // Set the selected address as default
      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        return next(new ErrorHandler("Address not found", 404));
      }

      user.addresses[addressIndex].isDefault = true;
      user.addresses[addressIndex].updatedAt = new Date();

      await user.save();

      res.status(200).json({
        success: true,
        message: "Default address set successfully",
        address: user.addresses[addressIndex]
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get cities with available addresses
router.get(
  "/user-addresses-cities",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const cities = new Set();
      user.addresses.forEach(address => {
        if (address.city) {
          cities.add(address.city);
        }
      });

      const citiesArray = Array.from(cities).map(city => ({
        name: city,
        addressCount: user.addresses.filter(addr => addr.city === city).length
      }));

      res.status(200).json({
        success: true,
        cities: citiesArray
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
