const mongoose = require("mongoose");

const categoriesSchema = mongoose.Schema({
  name: {
    type: String
  },
  arname: {
    type: String
  },
  icon_link: {
    type: String
  }
});

module.exports = mongoose.model('Categories', categoriesSchema);