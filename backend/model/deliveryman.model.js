const mongoose = require('mongoose');

const deliverymanSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    deliverymanType: {
        type: String,
        required: true,
        enum: ['freelancer', 'full-time']
    },
    zone: {
        type: String,
        required: true
    },
    vehicle: {
        type: String,
        required: true
    },
    deliverymanImage: {
        type: String,
        required: true
    },
    identityType: {
        type: String,
        required: true,
        enum: ['passport', 'driving-license']
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    identityImage: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Deliveryman', deliverymanSchema); 