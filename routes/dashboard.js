const express = require("express");
const { protect } = require("../middleware/auth");
const {
  viewTotalExpense
} = require("../controllers/dashboard");
const multer = require("multer");
const parse = multer();

const router = express.Router();
router.route("/").get(protect, viewTotalExpense);

// router.route("/:id").put(protect, editAccounts).get(protect, viewAccount).delete(protect, deleteAccount);

module.exports = router;