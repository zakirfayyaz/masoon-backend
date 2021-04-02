const mongoose = require("mongoose");
const { model } = require("./tags");

const billSchema = mongoose.Schema({
  name: {
    type: String
  },
  user_id: {
    type: mongoose.Types.ObjectId
  },
  category_id: {
    type: mongoose.Types.ObjectId
  },
  sub_category_id: {
    type: mongoose.Types.ObjectId
  },
  account_id: {
    type: mongoose.Types.ObjectId
  },
  budget_id: {
    type: mongoose.Types.ObjectId
  },
  actual_amount: {
    type: Number
  },
  amount: {
    type: Number,
    default: 0,
  },
  due_date: {
    type: Date
  },
  Paid_On: {
    type: Date
  },
  status: {
    type: String,
    default: "Due"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notified_for_last_Date: {
    type: Boolean,
    default: false
  },
  notified_for_last_date_passed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Bill", billSchema);
