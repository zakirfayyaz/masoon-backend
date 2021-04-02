const express = require("express");
const { protect } = require("../middleware/auth");
const { sendEmail } = require('../controllers/email');

const router = express.Router();
const multer = require("multer");
const parse = multer();

// router.route("/send").get( protect,parse.any(), send_otp);
router.route("/send").post(protect, parse.any(), sendEmail);

module.exports = router;