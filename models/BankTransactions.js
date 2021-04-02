const mongoose = require("mongoose");
const { model } = require("./tags");

const bankTransactionsSchema = mongoose.Schema({
  bank_id: {
    type: mongoose.Types.ObjectId
  },
  amount: {
    type: Number
  },
  type:{
      type: String
  },
  merchant:{
      type: String
  },
  description: {
      type: String
  },
  payment_type:{
      type: String,
      default: 'Credit'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("BankTransactions", bankTransactionsSchema);
