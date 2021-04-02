const mongoose = require('mongoose');

const userMailSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId
    },
    message:{
        type: String
    },
    createdAt: {
        type: Date
    },
    reply:{
        type: String
    },
    name:{
        type: String
    },
    email: {
        type: String
    }
})

module.exports = new mongoose.model('UserEmail', userMailSchema);