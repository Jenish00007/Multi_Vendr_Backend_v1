const Cart = require('../model/cart');
const Product = require('../model/product');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

// Add to cart
exports.addToCart = catchAsyncErrors(async (req, res, next) => {
    const { productId, quantity, selectedVariation } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // Check if product is in stock
    if (product.stock < quantity) {
        return next(new ErrorHandler('Product is out of stock', 400));
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

    res.status(201).json({
        success: true,
        cartItem
    });
});

// Update cart item quantity
exports.updateCartItem = catchAsyncErrors(async (req, res, next) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    const cartItem = await Cart.findOne({ _id: cartItemId, user: userId });
    if (!cartItem) {
        return next(new ErrorHandler('Cart item not found', 404));
    }

    // Check if product is in stock
    const product = await Product.findById(cartItem.product);
    if (product.stock < quantity) {
        return next(new ErrorHandler('Product is out of stock', 400));
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
        success: true,
        cartItem
    });
});

// Remove from cart
exports.removeFromCart = catchAsyncErrors(async (req, res, next) => {
    const { cartItemId } = req.params;
    const userId = req.user._id;

    const cartItem = await Cart.findOneAndDelete({ _id: cartItemId, user: userId });
    
    if (!cartItem) {
        return next(new ErrorHandler('Cart item not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Item removed from cart'
    });
});

// Get user's cart
exports.getCart = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    const cartItems = await Cart.find({ user: userId })
        .populate({
            path: 'product',
            select: 'name price images description stock'
        });

    // Calculate total
    let total = 0;
    cartItems.forEach(item => {
        total += item.product.price * item.quantity;
    });

    res.status(200).json({
        success: true,
        cartItems,
        total
    });
}); 