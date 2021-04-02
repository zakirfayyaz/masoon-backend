const mongoose = require('mongoose');

const appInstalledSchema = mongoose.Schema({
    device_id: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = new mongoose.model('AppInstalled', appInstalledSchema);