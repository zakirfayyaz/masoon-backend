const express = require("express");
const { protect } = require("../middleware/auth");
const { createTags, viewTags,viewTagsofCurrentUser, deleteTag } = require("../controllers/tags");

const router = express.Router();
const multer = require("multer");
const parse = multer();

router.route("/add").post(protect, parse.any(), createTags);
router.route('/getall').get(protect, parse.any(), viewTags);
router.route('/get').get(protect, parse.any(), viewTagsofCurrentUser);
router.route('/remove/:id').delete(protect, parse.any(), deleteTag);

module.exports = router;