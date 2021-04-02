const mongoose = require("mongoose");

const adsSchema = mongoose.Schema({
    title: {
        type: String
    },
    arTitle: {
        type: String
    },
    arDescription: {
        type: String
    },
    description: {
        type: String
    },
    file: {
        type: String
    },
    link: {
        type: String
    },
    user_id: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: String,
        default: 'Pending'
    },
    createdAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    },
    user_package_id: {
        type: mongoose.Types.ObjectId
    },
    views: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },
    type: {
        type: String
    }
});

module.exports = mongoose.model('Ads', adsSchema);