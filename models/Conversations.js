const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
    sender_id :{
        type: mongoose.Types.ObjectId
    },
    message: {
        type: String
    },
    status:{
        type: String,
        default: "Unread"
    },
    subject: {
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    roll: {
        type: String
    },
    conversation_id:{
        type: mongoose.Types.ObjectId
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Conversation', conversationSchema);