const mongoose = require('mongoose');

const userPackageSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId
    },
    package_id: {
        type: mongoose.Types.ObjectId
    },
    createdAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        default: null
    },
    approvedAt: {
        type: Date
    },
    status: {
        type: String
    },
    ads_count: {
        type: Number
    },
    total_ads_allowed: {
        type: Number
    },
    user_name: {
        type: String
    },
    package_arname: {
        type: String
    },
    package_name: {
        type: String
    }
})
module.exports = new mongoose.model('UserPackage', userPackageSchema);