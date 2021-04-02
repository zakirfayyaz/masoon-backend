const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createCategory, viewCategories
} = require("../controllers/categories");
const multer = require("multer");
const parse = multer();

const router = express.Router();

router.route("/add").post(protect, createCategory);
router.route("/get").get(protect, viewCategories);

// router.route("/:id").put(protect, editAccounts).get(protect, viewAccount).delete(protect, deleteAccount);

module.exports = router;