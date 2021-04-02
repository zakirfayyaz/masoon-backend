const mongoose = require("mongoose");

const account_typeSchema = mongoose.Schema({
  _id: {
    type: Number,
    required: [true, '_id is required']
  },
  name: {
    type: String
  }
});

module.exports = mongoose.model('Account_type', account_typeSchema);