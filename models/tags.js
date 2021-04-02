const mongoose = require("mongoose");

const tagsSchema = mongoose.Schema({
  name: {
    type: String
    // required: [true, "Tag name is required"],
    // maxlength: [50, "maximum of 50 characters allowed for name"],
  },
  user_id: {
    type: mongoose.Types.ObjectId
    // required: [true, 'USER_ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Tag', tagsSchema);
