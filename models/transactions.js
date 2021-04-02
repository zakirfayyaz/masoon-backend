const mongoose = require('mongoose');

// var tagSchema = mongoose.Schema({
//     name: String
// });

const transactionSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId
    },
    account_id: {
        type: mongoose.Types.ObjectId
    },
    merchant: {
        type: String
    },
    description: {
        type: String
    },
    sub_category_id: {
        type: mongoose.Types.ObjectId
    },
    category_id: {
        type: String
    },
    amount: {
        type: Number
    },
    type: {
        type: String
    },
    payment_type: {
        type: String
    },
    date: {
        type: Date
    },
    tags: {
        type: [mongoose.Types.ObjectId]
    },
    notes: {
        type: String
    },
    budget_id: {
        type: mongoose.Types.ObjectId
    },
    bank_transaction_id: {
        type: mongoose.Types.ObjectId
    }
})

module.exports = mongoose.model('Transaction', transactionSchema);