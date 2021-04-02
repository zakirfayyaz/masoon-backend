const mongoose = require("mongoose");
const categories = require("./categories");

const sub_categoriesSchema = mongoose.Schema({
  name: {
    type: String,
  },
  category_id: {
    type: mongoose.Types.ObjectId,
  },
  arname: {
    type: String
  }
});

module.exports = mongoose.model('Sub_categories', sub_categoriesSchema);