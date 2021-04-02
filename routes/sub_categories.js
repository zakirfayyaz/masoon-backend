const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createSubCategory,
  viewSubCategories
} = require("../controllers/sub_categories");
const multer = require("multer");
const parse = multer();

const router = express.Router();

router.route("/add").post(protect, parse.any(), createSubCategory);
router.route("/get-id").put(protect, parse.any(), viewSubCategories);


module.exports = router;