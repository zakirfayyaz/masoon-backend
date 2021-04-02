const mongoose = require('mongoose');

const banksSchema = mongoose.Schema({
    bank_name: {
        type: String
    },
    bank_id: {
        type: String
    },
    account_no: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user_id: {
        type: mongoose.Types.ObjectId
    },
    user_name: {
        type: String
    },
    user_phone: {
        type: String
    },
    bank_logo:{
        type: String
    },
    bank_url:{
        type: String
    }
})

module.exports = new mongoose.model('Bank', banksSchema);