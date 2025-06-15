const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
    addToCart,
    updateCartItem,
    removeFromCart,
    getCart
} = require('../controller/cartController');

router.post('/add', isAuthenticated, addToCart);
router.put('/update/:cartItemId', isAuthenticated, updateCartItem);
router.delete('/remove/:cartItemId', isAuthenticated, removeFromCart);
router.get('/all', isAuthenticated, getCart);

module.exports = router; 