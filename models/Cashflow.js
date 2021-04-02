const mongoose = require('mongoose');
const CashFlowSchema = new mongoose.Schema({
    name: {
        type: String
    },
    enabled: {
        type: String,
        default: "false"
    }
})
module.exports = new mongoose.model('CashFlow', CashFlowSchema);