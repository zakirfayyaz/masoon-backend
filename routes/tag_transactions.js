const express = require("express");
const { protect } = require("../middleware/auth");
const { viewTagsTransactions } = require("../controllers/tag_transactions");

const router = express.Router();
const multer = require("multer");
const parse = multer();

router.route('/get/:id').get(protect, parse.any(), viewTagsTransactions);

module.exports = router;