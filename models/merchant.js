const mongoose = require("mongoose");

const merchantSchema = mongoose.Schema({
  name: {
    type: String
  },
  user_id: {
      type: mongoose.Types.ObjectId
  }
});

module.exports = mongoose.model('Merchant', merchantSchema);