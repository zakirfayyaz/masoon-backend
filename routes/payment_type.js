const express = require("express");
const { protect } = require("../middleware/auth");
const { createPaymentType, viewPaymentTypes } = require("../controllers/payment_type");

const router = express.Router();
const multer = require("multer");
const parse = multer();

router.route("/add").post(protect, parse.any(), createPaymentType);
router.route('/get').get(protect, parse.any(), viewPaymentTypes);

module.exports = router;