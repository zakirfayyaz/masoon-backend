const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    body: {
        type: String
    },
    user_id: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: String,
        default: 'Unread'
    },
    subject: {
        type: String
    },
    armessage: {
        type: String
    },
    arsubject: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String
    }
});

module.exports = mongoose.model('Messages', messageSchema);