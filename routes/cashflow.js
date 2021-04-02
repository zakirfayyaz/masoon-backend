const express = require("express");
const { protect } = require("../middleware/auth");
const {
  viewCashFlow
} = require("../controllers/cashflow");
const multer = require("multer");
const parse = multer();

const router = express.Router();
router.route('/get').get(protect, viewCashFlow);
module.exports = router;
