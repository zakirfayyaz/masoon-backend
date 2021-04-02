const mongoose = require("mongoose");
const impressionSchema = mongoose.Schema({
    ad_id: {
        type: mongoose.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Impressions', impressionSchema);