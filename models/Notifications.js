const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
    body: {
        type: String
    },
    arbody: {
        type: String
    },
    user_id: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: String,
        default: 'Unread'
    },
    arsubject: {
        type: String
    },
    subject: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String
    },
    bill_id: {
        type: mongoose.Types.ObjectId
    },
    budget_id: {
        type: mongoose.Types.ObjectId
    }
});

module.exports = mongoose.model('Notification', notificationSchema);