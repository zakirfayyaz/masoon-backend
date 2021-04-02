const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    bill_id:{
        type: mongoose.Types.ObjectId
    },
    user_id:{
        type: mongoose.Types.ObjectId
    },
    bill_name:{
        type: String
    },
    amount:{
        type: Number
    },
    status:{
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Payment', transactionSchema);