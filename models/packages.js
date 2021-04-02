const mongoose = require("mongoose");

const packageSchema = mongoose.Schema({
  amount: {
    type: Number
  },
  clicks: {
    type: Number
  },
  views: {
    type: Number
  },
  duration: {
    type: Number
  },
  description: {
    type: String
  },
  arDescription: {
    type: String
  },
  name: {
    type: String
  },
  arname: {
    type: String
  },
  ads_per_package: {
    type: Number
  }
});

module.exports = mongoose.model("Package", packageSchema);
