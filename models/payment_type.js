const mongoose = require("mongoose");

const payment_typeScheme = mongoose.Schema({
  _id: {
    type: Number
  },
  name: {
    type: String
  }
});

module.exports = mongoose.model('Payment_type', payment_typeScheme);