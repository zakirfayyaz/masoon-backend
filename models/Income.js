const mongoose = require("mongoose");

const incomeSchema = mongoose.Schema({
    month: {
        type: String
    },
    year: {
        type: String
    },
    amount: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: null
    },
    user_id: {
        type: mongoose.Types.ObjectId
    },
    title: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('Income', incomeSchema);