const mongoose = require('mongoose');

const loggerSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId
    },
    time: {
        type: Date
    },
    username: {
        type: String
    },
    roll:{
        type: String
    },
    user_email: {
        type: String
    }
})

module.exports = new mongoose.model('Logger', loggerSchema);