const express = require("express");
const { protect } = require("../middleware/auth");
const { send_otp, verify_otp } = require("../controllers/verify_otp");

const router = express.Router();
const multer = require("multer");
const parse = multer();

router.route("/send").get( protect,parse.any(), send_otp);
router.route("/verify").post( protect,parse.any(), verify_otp);

module.exports = router;