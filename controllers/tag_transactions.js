const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");
const Tag_transaction = require("../models/tag_transaction");
const Tags = require("../models/tags");

exports.viewTagsTransactions = asyncHandler(async (req, res, next) => {
  const user_id = req.user.id;
  try {
    const user_tags = await Tags.find({ user_id });
    for(let i = 0; i < user_tags.length;i++) {
      const tags_id = await Tag_transaction.find({ user_id, tags_id: user_tags[i]});
    }
    const tags_id_count = await Tag_transaction.find({ user_id, tags_id: req.params.id });
    res.status(200).json({
      status: 200,
      count: tags_id_count.length,
      data: tags_id_count
    });
    const tag_transactions = await Tag_transaction.find({ user_id, tags_id: req.params.id });

  } catch (err) {
    next(err);
  }
});

