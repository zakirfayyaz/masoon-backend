const mongoose = require('mongoose');

const smsCategorizeSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId
    },
    categories: {
        type: mongoose.Types.ObjectId
    },
    subcategories: {
        type: mongoose.Types.ObjectId
    },
    amount: {
        type: Number
    },
    _address: {
        type: String
    },
    _msg: {
        type: String
    },
    _time: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    _folderName: {
        type: String
    },
    _readState: {
        type: Number
    },
    sms_id: {
        type: mongoose.Types.ObjectId
    }
})

module.exports = mongoose.model('SmsCategorize', smsCategorizeSchema);