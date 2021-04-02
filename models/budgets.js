const mongoose = require('mongoose');
const budgetSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId
    },
    month: {
        type: String
    },
    year: {
        type: Number
    },
    category_id: {
        type: String
    },
    amount: {
        type: Number
    },
    remaining_amount: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    notified_for_half: {
        type: Boolean,
        default: false
    },
    notified_for_quarter: {
        type: Boolean,
        default: false
    },
    notified_for_last: {
        type: Boolean,
        default: false
    }
});

// budgetSchema.pre("save", async function (next) {
//     return this.month = month.toLowerCase();
//   });


module.exports = mongoose.model("Budget", budgetSchema);
