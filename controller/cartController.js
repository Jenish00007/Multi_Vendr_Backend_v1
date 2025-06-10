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

    // Populate product details
    cartItem = await Cart.findById(cartItem._id).populate({
        path: 'product',
        select: 'name price originalPrice discountPrice images description stock'
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
            select: 'name price originalPrice discountPrice images description stock'
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