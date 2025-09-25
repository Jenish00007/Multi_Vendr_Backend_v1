const Cart = require('../model/cart');
const Product = require('../model/product');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

// Add to cart
exports.addToCart = catchAsyncErrors(async (req, res, next) => {
    const { productId, quantity, selectedVariation } = req.body;
    const userId = req.user._id;

    // Input validation
    const mongoose = require('mongoose');
    if (!productId) {
        return next(new ErrorHandler('Product ID is required', 400));
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorHandler('Invalid product ID format', 400));
    }
    if (!quantity || quantity <= 0 || !Number.isInteger(Number(quantity))) {
        return next(new ErrorHandler('Quantity must be a positive integer', 400));
    }
    if (Number(quantity) > 999) {
        return next(new ErrorHandler('Quantity cannot exceed 999', 400));
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // Check if product is in stock
    if (product.stock < quantity) {
        return next(new ErrorHandler(`Only ${product.stock} items available in stock`, 400));
    }

    // Check if product already in cart
    let cartItem = await Cart.findOne({
        user: userId,
        product: productId,
        selectedVariation: selectedVariation || null
    });

    if (cartItem) {
        // Update quantity if product already in cart
        cartItem.quantity = quantity;
        await cartItem.save();
    } else {
        // Create new cart item
        cartItem = await Cart.create({
            user: userId,
            product: productId,
            quantity,
            selectedVariation: selectedVariation || null
        });
    }

    // Populate product details
    cartItem = await Cart.findById(cartItem._id).populate({
        path: 'product',
        select: 'name price originalPrice discountPrice images description stock shopId shop'
    });

    // Calculate price details
    const price = Number(cartItem.product.price) || 0;
    const originalPrice = Number(cartItem.product.originalPrice) || price;
    const itemSubtotal = price * quantity;
    const itemOriginalTotal = originalPrice * quantity;
    const itemDiscount = itemOriginalTotal - itemSubtotal;

    const cartItemWithPrices = {
        ...cartItem.toObject(),
        itemSubtotal,
        itemOriginalTotal,
        itemDiscount,
        priceDetails: {
            unitPrice: price,
            originalUnitPrice: originalPrice,
            totalPrice: itemSubtotal,
            totalOriginalPrice: itemOriginalTotal,
            discountAmount: itemDiscount
        }
    };

    res.status(201).json({
        success: true,
        cartItem: cartItemWithPrices
    });
});

// Update cart item quantity
exports.updateCartItem = catchAsyncErrors(async (req, res, next) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // Input validation
    const mongoose = require('mongoose');
    if (!cartItemId) {
        return next(new ErrorHandler('Cart item ID is required', 400));
    }
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
        return next(new ErrorHandler('Invalid cart item ID format', 400));
    }
    if (!quantity || quantity <= 0 || !Number.isInteger(Number(quantity))) {
        return next(new ErrorHandler('Quantity must be a positive integer', 400));
    }
    if (Number(quantity) > 999) {
        return next(new ErrorHandler('Quantity cannot exceed 999', 400));
    }

    const cartItem = await Cart.findOne({ _id: cartItemId, user: userId });
    if (!cartItem) {
        return next(new ErrorHandler('Cart item not found', 404));
    }

    // Check if product is in stock
    const product = await Product.findById(cartItem.product);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }
    if (product.stock < quantity) {
        return next(new ErrorHandler(`Only ${product.stock} items available in stock`, 400));
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
        success: true,
        cartItem
    });
});

// Remove single item from cart
exports.removeFromCart = catchAsyncErrors(async (req, res, next) => {
    try {
        const { cartItemId } = req.params;
        const userId = req.user._id;

        // Input validation
        const mongoose = require('mongoose');
        if (!cartItemId) {
            return next(new ErrorHandler('Cart item ID is required', 400));
        }

        if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
            return next(new ErrorHandler('Invalid cart item ID format', 400));
        }

        // Find and remove the cart item
        const cartItem = await Cart.findOneAndDelete({ 
            _id: cartItemId, 
            user: userId 
        });

        if (!cartItem) {
            return next(new ErrorHandler('Cart item not found or access denied', 404));
        }

        console.log(`Cart item removed for user ${userId}: Item ${cartItemId}`);

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            removedItemId: cartItemId
        });

    } catch (error) {
        console.error('Error in removeFromCart:', error);
        return next(new ErrorHandler(error.message || 'Failed to remove cart item', 500));
    }
});

// Remove multiple items from cart
exports.removeMultipleFromCart = catchAsyncErrors(async (req, res, next) => {
    try {
        const { cartItems } = req.body;
        const userId = req.user._id;

        // Input validation
        if (!cartItems || !Array.isArray(cartItems)) {
            return next(new ErrorHandler('Cart items array is required', 400));
        }

        if (cartItems.length === 0) {
            return next(new ErrorHandler('At least one cart item ID is required', 400));
        }

        if (cartItems.length > 100) {
            return next(new ErrorHandler('Cannot remove more than 100 items at once', 400));
        }

        // Validate each cart item ID
        const mongoose = require('mongoose');
        for (let i = 0; i < cartItems.length; i++) {
            if (!mongoose.Types.ObjectId.isValid(cartItems[i])) {
                return next(new ErrorHandler(`Invalid cart item ID at index ${i}`, 400));
            }
        }

        // Remove multiple cart items
        const result = await Cart.deleteMany({ 
            _id: { $in: cartItems }, 
            user: userId 
        });

        console.log(`Removed ${result.deletedCount} cart items for user ${userId}`);

        if (result.deletedCount === 0) {
            return next(new ErrorHandler('No cart items found or access denied', 404));
        }

        res.status(200).json({ 
            success: true, 
            message: `${result.deletedCount} items removed from cart`,
            removedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error in removeMultipleFromCart:', error);
        return next(new ErrorHandler(error.message || 'Failed to remove cart items', 500));
    }
});

// Get user's cart
exports.getCart = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    const cartItems = await Cart.find({ user: userId })
        .populate({
            path: 'product',
            select: 'name price originalPrice discountPrice images description stock shopId shop'
        });

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    let total = 0;
    let totalItems = 0;
    let totalOriginalPrice = 0;

    const itemsWithPrices = cartItems.map(item => {
        // Ensure price values are numbers
        const price = Number(item.product.price) || 0;
        const originalPrice = Number(item.product.originalPrice) || price;
        const quantity = Number(item.quantity) || 0;

        const itemSubtotal = price * quantity;
        const itemOriginalTotal = originalPrice * quantity;
        const itemDiscount = itemOriginalTotal - itemSubtotal;
        const itemTotal = itemSubtotal;
        
        subtotal += itemSubtotal;
        totalOriginalPrice += itemOriginalTotal;
        totalDiscount += itemDiscount;
        totalItems += quantity;

        return {
            ...item.toObject(),
            itemSubtotal,
            itemOriginalTotal,
            itemDiscount,
            itemTotal,
            priceDetails: {
                unitPrice: price,
                originalUnitPrice: originalPrice,
                totalPrice: itemTotal,
                totalOriginalPrice: itemOriginalTotal,
                discountAmount: itemDiscount
            }
        };
    });

    // Calculate final totals
    total = subtotal;

    res.status(200).json({
        success: true,
        cartItems: itemsWithPrices,
        priceSummary: {
            totalItems,
            subtotal: Number(subtotal.toFixed(2)),
            totalOriginalPrice: Number(totalOriginalPrice.toFixed(2)),
            totalDiscount: Number(totalDiscount.toFixed(2)),
            total: Number(total.toFixed(2)),
            currency: "INR",
            savings: Number(totalDiscount.toFixed(2))
        }
    });
}); 