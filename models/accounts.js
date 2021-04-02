const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const accountSchema = mongoose.Schema({
    name: {
        type: String
    },
    url: {
        type: String
    },
    logo: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String
    }
})

module.exports = new mongoose.model('Account', accountSchema);