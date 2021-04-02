const mongoose = require("mongoose");

const revenueSchema = mongoose.Schema({
    user_package_id: {
        type: mongoose.Types.ObjectId
    },
    amount: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user_id: {
        type: mongoose.Types.ObjectId
    },
    user_package_name: {
        type: String
    },
    user_package_arname: {
        type: String
    }
});

module.exports = mongoose.model('Revenue', revenueSchema);