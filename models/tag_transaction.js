const mongoose = require("mongoose");

const tag_transactionSchema = mongoose.Schema({
  tags_id: {
    type: mongoose.Types.ObjectId
  },
  transaction_id: {
    type: mongoose.Types.ObjectId
  },
  user_id:{
    type: mongoose.Types.ObjectId
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tag_transaction', tag_transactionSchema);