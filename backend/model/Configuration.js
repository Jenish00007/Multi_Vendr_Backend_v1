const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
    appName: {
        type: String,
        required: true
    },
    appNameLowerLetter: {
        type: String,
        required: true,
        lowercase: true
    },
    appPackageId: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: String,
        required: true
    },
    versionCode: {
        type: Number,
        required: true,
        default: 1
    },
    projectId: {
        type: String,
        required: true
    },
    appIcon: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    appColors: {
        primary: {
            type: String
        },
        secondary: {
            type: String
        },
        accent: {
            type: String
        }
    },
    socialMediaLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    },
    contactInfo: {
        email: String,
        phone: String,
        address: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Configuration', configurationSchema); 