const express = require("express");
const { dataEntry, copyData } = require("../controllers/dateEntry");
const { protect } = require("../middleware/auth");

const router = express.Router();
// const multer = require("multer");
// const parse = multer();
router.route("/").put(protect, dataEntry);

module.exports = router;