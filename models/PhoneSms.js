const mongoose = require('mongoose');

const phoneSmsSchema = mongoose.Schema({
    
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
    user_id: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: String,
        default: 'Unread'
    }
})

module.exports = new mongoose.model('PhoneSms', phoneSmsSchema);