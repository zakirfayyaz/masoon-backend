const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId
    },
    rating:{
        type: Number
    },
    createdAt: {
        type: Date
    },
    message: {
        type: String
    },
    name:{
        type: String
    },
    email: {
        type: String
    }
})

module.exports = new mongoose.model('Rating', ratingSchema);